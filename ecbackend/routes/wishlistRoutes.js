import express from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from "../controllers/wishlistController.js";

import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getWishlist);
router.post("/", authenticateToken, addToWishlist);

//router.delete("/:productId", authenticateToken, removeFromWishlist);
router.delete("/:product_id", authenticateToken, removeFromWishlist);

export default router;