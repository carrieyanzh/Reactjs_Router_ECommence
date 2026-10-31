import express from "express";

import {
  getAddresses,
  createAddress
} from "../controllers/addressController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All address APIs require authentication
router.use(authMiddleware);

// GET /api/addresses
router.get("/", getAddresses);

// POST /api/addresses
router.post("/", createAddress);

export default router;