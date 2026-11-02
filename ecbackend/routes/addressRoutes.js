import express from "express";

import {
  getAddresses,
  createAddress,
  deleteAddress,
  updateAddress 
} from "../controllers/addressController.js";

//import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

//router.use(authMiddleware);

router.get("/", getAddresses);
router.post("/", createAddress);
router.delete("/:id", deleteAddress);
router.put("/:id", updateAddress);

export default router;