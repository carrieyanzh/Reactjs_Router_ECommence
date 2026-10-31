import db from "../db.js";

// Get all products or filter by categoryId
export const getProducts = (req, res) => {
  const { categoryId } = req.query;

  let sql = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.description,
      p.emoji,
      p.category_id,
      c.name AS category
    FROM products p
    JOIN categories c
      ON p.category_id = c.id
  `;

  const params = [];

  if (categoryId) {
    sql += " WHERE p.category_id = ?";
    params.push(categoryId);
  }

  db.all(sql, params, (error, rows) => {
    if (error) {
      return res.status(500).json({
        message: "Failed to retrieve products",
      });
    }

    res.json(rows);
  });
};

// Get one product by ID
export const getProductById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.description,
      p.emoji,
      p.category_id,
      c.name AS category
    FROM products p
    JOIN categories c
      ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.get(sql, [id], (error, row) => {
    if (error) {
      return res.status(500).json({
        message: "Failed to retrieve product",
      });
    }

    if (!row) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(row);
  });
};