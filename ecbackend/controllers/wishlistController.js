import db from "../db.js";


export const getWishlist = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in first." });
  }

  // ✅ Make sure p.id is selected cleanly so the frontend can map item.id
  const sql = `
    SELECT
      w.id AS wishlist_id,
      p.id, 
      p.name, 
      p.price, 
      p.description, 
      p.emoji, 
      p.category_id
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC `;

  try {
    const result = await db.execute({
      sql: sql,
      args: [userId]
    });
    
    // ✅ Returns the clean array of objects directly
    return res.json(result.rows);
  } catch (err) {
    console.error("Get wishlist error:", err.message);
    return res.status(500).json({ message: "Unable to retrieve wishlist" });
  }
};



export const addToWishlist = async (req, res) => {
  const userId = req.user?.id;
  const { product_id } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required"
    });
  }

  try {   
    const checkSql = "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?";
    const existing = await db.execute({ sql: checkSql, args: [userId, product_id] });
    
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        message: "Product is already in wishlist"
      });
    }

    const insertSql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";
    const insertResult = await db.execute({
      sql: insertSql,
      args: [userId, product_id]
    });

    let newWishlistId = null;
    if (insertResult.lastInsertRowid) {
      newWishlistId = insertResult.lastInsertRowid.toString();
    } else if (insertResult.insertId) {
      newWishlistId = insertResult.insertId.toString();
    }

    return res.status(201).json({
      message: "Product added to wishlist",
      wishlist_id: newWishlistId
    });
  } catch (err) {
    console.error("Add wishlist error:", err.message);
    return res.status(500).json({
      message: "Unable to add product to wishlist"
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  const userId = req.user?.id;
  const { productId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  const sql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";

  try {
    const result = await db.execute({
      sql: sql,
      args: [userId, productId]
    });
    
    const changes = result.rowsAffected !== undefined ? result.rowsAffected : result.affectedRows;

    if (changes === 0) {
      return res.status(404).json({
        message: "Wishlist product not found or already removed"
      });
    }

    return res.json({
      message: "Product removed from wishlist"
    });
  } catch (err) {
    console.error("Remove wishlist error:", err.message);
    return res.status(500).json({
      message: "Unable to remove product"
    });
  }
};
