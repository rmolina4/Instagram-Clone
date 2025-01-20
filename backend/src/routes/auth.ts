import express, { Router } from "express";
import {
  register,
  login,
  deactivateAccount,
  verifyEmail,
  authenticateToken,
} from "../controllers/auth";

const router: Router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/deactivate", authenticateToken, deactivateAccount);
router.post("/verify", authenticateToken, verifyEmail);

export default router;
