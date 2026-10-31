import express from "express";

const router = express.Router();

// GET all orders
router.get("/", (req, res) => {
  res.json({ message: "Get all orders" });
});

// POST create order
router.post("/", (req, res) => {
  res.json({ message: "Create order" });
});

export default router;