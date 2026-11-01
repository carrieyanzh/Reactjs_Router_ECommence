import express from "express";
import { login, getCurrentUser, logout } from "../controllers/authController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import { registerUser} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", registerUser);

router.get("/me", authenticateToken, getCurrentUser);

export default router;
