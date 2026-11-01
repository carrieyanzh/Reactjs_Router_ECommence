import express from "express";

import {
  getAddresses,
  createAddress,
  deleteAddress // 1. Add this import
} from "../controllers/addressController.js";

//import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

//router.use(authMiddleware);

// GET /api/addresses
router.get("/", getAddresses);
// POST /api/addresses
router.post("/", createAddress);

router.delete("/:id", deleteAddress);

export default router;