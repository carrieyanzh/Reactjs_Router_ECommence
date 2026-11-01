import db from "../db.js";

export const createOrder = (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }
  
  db.serialize(() => {
    db.run("BEGIN IMMEDIATE TRANSACTION");

    let calculatedTotal = 0;
    const verifiedItems = [];

    const queryProductStmt = db.prepare(`SELECT price, stock, name FROM products WHERE id = ?`);
    const checkAndReduceStockStmt = db.prepare(`UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`);
    const insertItemStmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);

    const abortTransaction = (statusCode, alertMessage) => {
      queryProductStmt.finalize();
      checkAndReduceStockStmt.finalize();
      insertItemStmt.finalize();
      db.run("ROLLBACK", () => {
        return res.status(statusCode).json({ message: alertMessage });
      });
    };

    const verifyAndCalculateSequentially = (idx) => {
      if (idx === items.length) {
        proceedToInsertOrder();
        return;
      }

      const clientItem = items[idx];      
      
      queryProductStmt.get([clientItem.id], (err, productRow) => {
        if (err || !productRow) {
          return abortTransaction(400, `Product validation failed for item ID: ${clientItem.id}`);
        }

        if (productRow.stock < clientItem.quantity) {
          return abortTransaction(400, `Insufficient stock for product: ${productRow.name}. Available: ${productRow.stock}`);
        }
        
        const itemTruePrice = productRow.price;
        calculatedTotal += itemTruePrice * clientItem.quantity;
        
        verifiedItems.push({
          id: clientItem.id,
          quantity: clientItem.quantity,
          price: itemTruePrice
        });
        
        verifyAndCalculateSequentially(idx + 1);
      });
    };
    
    const proceedToInsertOrder = () => {
      db.run(
        `INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)`,
        [userId, calculatedTotal, "Confirmed"],
        function (orderErr) {
          if (orderErr) {
            console.error("Order Insert Error:", orderErr);
            return abortTransaction(500, "Unable to save main order records.");
          }

          const orderId = this.lastID; // 获取生成的订单主键 ID
          executeStockAndItemsWrite(orderId, 0);
        }
      );
    };
    
    const executeStockAndItemsWrite = (orderId, idx) => {
      if (idx === verifiedItems.length) {       
        queryProductStmt.finalize();
        checkAndReduceStockStmt.finalize();
        insertItemStmt.finalize();

        // 最终提交
        db.run("COMMIT", (commitErr) => {
          if (commitErr) {
            return db.run("ROLLBACK", () => {
              res.status(500).json({ message: "Transaction commit failed." });
            });
          }
          return res.status(201).json({
            message: "Order placed successfully! Inventory synchronized.",
            orderId,
            totalAmount: calculatedTotal
          });
        });
        return;
      }

      const secureItem = verifiedItems[idx];
      
      checkAndReduceStockStmt.run([secureItem.quantity, secureItem.id, secureItem.quantity], function (stockErr) {
        if (stockErr || this.changes === 0) {
          return abortTransaction(400, `Stock deduction failed at last minute for product ID ${secureItem.id}.`);
        }
        
        insertItemStmt.run([orderId, secureItem.id, secureItem.quantity, secureItem.price], (itemErr) => {
          if (itemErr) {
            return abortTransaction(500, "Failed to insert order item trace row.");
          }         
          executeStockAndItemsWrite(orderId, idx + 1);
        });
      });
    };
    
    verifyAndCalculateSequentially(0);
  });
};


export const getAllOrders = (req, res) => {
  const sql = `
    SELECT
      o.id AS order_id,
      o.user_id,
      o.total_amount,
      o.status,
      o.created_at,
      oi.id AS order_item_id,
      oi.product_id,
      oi.quantity,
      oi.price,
      p.name AS product_name
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    ORDER BY o.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Unable to retrieve all orders.",
      });
    }

    res.json(rows);
  });
};

export const getMyOrders = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      o.id AS order_id,
      o.total_amount,
      o.status,
      o.created_at,
      oi.id AS order_item_id,
      oi.product_id,
      oi.quantity,
      oi.price,
      p.name AS product_name,
      p.emoji AS product_emoji
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC, oi.id ASC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Get orders error:", err.message);

      return res.status(500).json({
        message: "Unable to retrieve orders.",
      });
    }

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          total: row.total_amount,
          status: row.status,
          date: row.created_at,
          items: [],
        });
      }

      if (row.order_item_id !== null) {
        ordersMap.get(row.order_id).items.push({
          id: row.order_item_id,
          productId: row.product_id,
          name: row.product_name,
          emoji: row.product_emoji,
          quantity: row.quantity,
          price: row.price,
        });
      }
    });

    res.json(Array.from(ordersMap.values()));
  });


  
};