import db from "../db.js";

export const getProducts = async (req, res) => {
  const { categoryId } = req.query;

  let sql = "SELECT p.id, p.name, p.price, p.description, p.emoji, p.category_id, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id";

  const params = [];

  if (categoryId) {
    sql += " WHERE p.category_id = ?";
    params.push(categoryId);
  }

  try {
    const result = await db.execute({
      sql: sql,
      args: params
    });

    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({
      message: "Failed to retrieve products",
    });
  }
};


export const getProductById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT p.id, p.name, p.price, p.description, p.emoji, p.category_id, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ?";

  try {
    const result = await db.execute({
      sql: sql,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({
      message: "Failed to retrieve product",
    });
  }
};