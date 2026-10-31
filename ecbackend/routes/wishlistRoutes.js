const express = require("express");
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require("../controllers/wishlistController");

const authenticateToken = require("../middleware/authMiddleware");

// All wishlist operations require login
router.get("/", authenticateToken, getWishlist);

router.post("/", authenticateToken, addToWishlist);

router.delete("/:productId", authenticateToken, removeFromWishlist);

module.exports = router;