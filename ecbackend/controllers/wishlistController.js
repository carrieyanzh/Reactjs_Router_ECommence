const db = require("../db");

const getWishlist = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT
      w.id AS wishlist_id,
      w.created_at,
      p.*
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Get wishlist error:", err);
      return res.status(500).json({
        message: "Unable to retrieve wishlist"
      });
    }

    res.json(rows);
  });
};


// POST: Add product to wishlist
const addToWishlist = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      message: "Product ID is required"
    });
  }

  const sql = `
    INSERT OR IGNORE INTO wishlist (user_id, product_id)
    VALUES (?, ?)
  `;

  db.run(sql, [userId, product_id], function (err) {
    if (err) {
      console.error("Add wishlist error:", err);
      return res.status(500).json({
        message: "Unable to add product to wishlist"
      });
    }

    if (this.changes === 0) {
      return res.status(409).json({
        message: "Product is already in wishlist"
      });
    }

    res.status(201).json({
      message: "Product added to wishlist",
      wishlist_id: this.lastID
    });
  });
};


// DELETE: Remove product from wishlist
const removeFromWishlist = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const sql = `
    DELETE FROM wishlist
    WHERE user_id = ? AND product_id = ?
  `;

  db.run(sql, [userId, productId], function (err) {
    if (err) {
      console.error("Remove wishlist error:", err);
      return res.status(500).json({
        message: "Unable to remove product"
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        message: "Wishlist product not found"
      });
    }

    res.json({
      message: "Product removed from wishlist"
    });
  });
};


module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};