import express from "express";

import {login, getCurrentUser, logout,} from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);
router.post("/logout", logout);

export default router;