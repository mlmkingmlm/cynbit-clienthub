
import express from "express";

import {
  registerClient,
  loginUser
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getClients } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerClient);
router.post("/login", loginUser);
router.get("/clients", protect, adminOnly, getClients);

export default router;
