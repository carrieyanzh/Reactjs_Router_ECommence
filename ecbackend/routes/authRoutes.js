import express from "express";
import { login, getCurrentUser, logout, registerUser } from "../controllers/authController.js";

import rateLimit from "express-rate-limit";
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/register", authLimiter, registerUser);
router.get("/me", authenticateToken, getCurrentUser);

export default router;
