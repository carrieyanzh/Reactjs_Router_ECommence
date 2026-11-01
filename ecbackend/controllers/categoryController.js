import db from "../db.js";

// Get all product categories
export const getCategories = async (req, res) => {
  const sql = "SELECT id, name, description, emoji FROM categories";

  try {
    const result = await db.execute(sql);
    res.json(result.rows);
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({
      message: "Failed to retrieve categories",
    });
  }
};

// Get one specific category by ID (if your controller has this function)
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT id, name, description, emoji FROM categories WHERE id = ?";

  try {
    const result = await db.execute({
      sql: sql,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({
      message: "Failed to retrieve category",
    });
  }
};