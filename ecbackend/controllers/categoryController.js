import db from "../db.js";

export const getCategories = (req, res) => {
  const sql = `
    SELECT
      c.id,
      c.name,
      c.description,
      c.emoji,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p
      ON c.id = p.category_id
    GROUP BY c.id
  `;

  db.all(sql, [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        message: "Failed to retrieve categories",
      });
    }

    res.json(rows);
  });
};