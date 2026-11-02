import db from "../db.js";

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }

  // 🛠️ 1. 创建原生 Libsql 事务对象，由底层库来全权负责事务的安全周期
  const tx = await db.transaction("write");

  try {
    let calculatedTotal = 0;
    const verifiedItems = [];

    // 逐个验证购物车中的商品单价与库存
    for (const clientItem of items) {
      // 🛠️ 注意：事务内的所有查询必须使用 tx.execute 而不是 db.execute
      const productResult = await tx.execute({
        sql: "SELECT price, stock, name FROM products WHERE id = ?",
        args: [clientItem.id]
      });

      const productRow = productResult.rows[0];

      if (!productRow) {
        await tx.rollback(); // 发生错误自动安全回滚
        return res.status(400).json({ message: `Product validation failed for item ID: ${clientItem.id}` });
      }

      if (productRow.stock < clientItem.quantity) {
        await tx.rollback(); // 库存不足自动安全回滚
        return res.status(400).json({ message: `Insufficient stock for product: ${productRow.name}. Available: ${productRow.stock}` });
      }

      calculatedTotal += productRow.price * clientItem.quantity;
      verifiedItems.push({
        id: clientItem.id,
        quantity: clientItem.quantity,
        price: productRow.price
      });
    }

    // 插入订单主表记录
    const orderInsertResult = await tx.execute({
      sql: "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)",
      args: [userId, calculatedTotal, "Confirmed"]
    });

    const orderId = orderInsertResult.lastInsertRowid || orderInsertResult.insertId;

    if (!orderId) {
      await tx.rollback();
      return res.status(500).json({ message: "Unable to save main order records." });
    }

    // 扣减库存并写入订单详情子表
    for (const secureItem of verifiedItems) {
      const stockUpdate = await tx.execute({
        sql: "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        args: [secureItem.quantity, secureItem.id, secureItem.quantity]
      });

      const changes = stockUpdate.rowsAffected !== undefined ? stockUpdate.rowsAffected : stockUpdate.affectedRows;
      if (changes === 0) {
        await tx.rollback();
        return res.status(400).json({ message: `Stock deduction failed at last minute for product ID ${secureItem.id}.` });
      }

      await tx.execute({
        sql: "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        args: [orderId, secureItem.id, secureItem.quantity, secureItem.price]
      });
    }

    // 🛠️ 2. 执行原生安全提交
    await tx.commit();

    return res.status(201).json({
      message: "Order placed successfully! Inventory synchronized.",
      orderId: orderId.toString(),
      totalAmount: calculatedTotal
    });

  } catch (error) {
    console.error("Order process system crash inside transaction:", error);
    try {
      // 🛠️ 3. 发生未知运行时异常时，执行安全闭环回滚
      await tx.rollback();
    } catch (e) {
      // 防止重复回滚抛出二次异常
    }
    return res.status(500).json({ message: "Internal server error during order creation." });
  }
};

export const getAllOrders = async (req, res) => {
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

  try {
    const result = await db.execute({ sql, args: [] });
    return res.json(result.rows);
  } catch (err) {
    console.error("GetAllOrders system error:", err);
    return res.status(500).json({ message: "Unable to retrieve all orders." });
  }
};

export const getMyOrders = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }

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

  try {
    const result = await db.execute({ sql, args: [userId] });
    const rows = result.rows || [];

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!row || row.order_id === undefined || row.order_id === null) return;

      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          id: row.order_id,
          total: row.total_amount || 0,
          status: row.status || "Confirmed",
          date: row.created_at || new Date().toISOString(),
          items: [],
        });
      }

      if (row.order_item_id !== null && row.order_item_id !== undefined) {
        ordersMap.get(row.order_id).items.push({
          id: row.order_item_id,
          productId: row.product_id,
          name: row.product_name || "Unknown Product",
          emoji: row.product_emoji || "🛍️",
          quantity: row.quantity || 0,
          price: row.price || 0,
        });
      }
    });

    return res.json(Array.from(ordersMap.values()));
  } catch (catchErr) {
    console.error("Data mapping runtime error in backend:", catchErr.message);
    return res.status(500).json({
      message: "Internal server error during data processing.",
      error: catchErr.message
    });
  }
};
