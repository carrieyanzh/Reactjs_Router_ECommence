import express from "express";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
} from "../controllers/ordersController.js";

//import { authenticateToken } from "../middleware/authMiddleware.js";
import authenticateToken from "../middleware/authMiddleware.js";
const router = express.Router();

// Create a new order
router.post("/", authenticateToken, createOrder);

// Get all orders
router.get("/", authenticateToken, getAllOrders);

// Get orders belonging to the logged-in user
router.get("/my-orders", authenticateToken, getMyOrders);

export default router;