import db , { batch } from "../db.js";

export const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order items are required." });
  }
 
  const wanted = new Map();
  for (const it of items) {
    const id = Number(it.id);
    const qty = Number(it.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "Invalid item id or quantity." });
    }
    wanted.set(id, (wanted.get(id) ?? 0) + qty);
  }

  try {    
    const ids = [...wanted.keys()];
    const placeholders = ids.map(() => "?").join(",");
    const { rows } = await db.execute(
      `SELECT id, price, stock, name FROM products WHERE id IN (${placeholders})`,
      ids
    );
    const byId = new Map(rows.map((r) => [r.id, r]));

    let total = 0;
    const verified = [];
    for (const [id, qty] of wanted) {
      const p = byId.get(id);
      if (!p) {
        return res.status(400).json({ message: `Product validation failed for item ID: ${id}` });
      }
      if (p.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${p.name}. Available: ${p.stock}`,
        });
      }
      total += p.price * qty;
      verified.push({ id, qty, price: p.price });
    }
    
    const statements = [
      {
        sql: "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)",
        params: [userId, total, "Confirmed"],
      },
      ...verified.flatMap((v) => [
        // 守卫：库存不足时故意报错，整批回滚
        {
          sql: "SELECT CASE WHEN (SELECT stock FROM products WHERE id = ?) < ? THEN json('invalid') END",
          params: [v.id, v.qty],
        },
        {
          sql: "UPDATE products SET stock = stock - ? WHERE id = ?",
          params: [v.qty, v.id],
        },
        {
          sql: "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ((SELECT MAX(id) FROM orders WHERE user_id = ?), ?, ?, ?)",
          params: [userId, v.id, v.qty, v.price],
        },
      ]),
    ];

    const results = await batch(statements);
    const orderId = results[0].meta.last_row_id;

    return res.status(201).json({
      message: "Order placed successfully! Inventory synchronized.",
      orderId: String(orderId),
      totalAmount: total,
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    const detail = JSON.stringify(error.response?.data?.errors ?? "");
    if (detail.includes("JSON")) {
      return res.status(409).json({ message: "Stock changed, please refresh your cart." });
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
