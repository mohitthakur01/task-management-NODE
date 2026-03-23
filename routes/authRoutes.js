import express from "express";
const router = express.Router();
import {
  register,
  login,
  logout,
  refreshToken,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", protect, logout);

// Refresh token (public – only requires a valid refresh token in body)
router.post("/refresh-token", refreshToken);

export default router;
