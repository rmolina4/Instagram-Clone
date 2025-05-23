import express, { Router } from "express";
import {
  register,
  login,
  deactivateAccount,
  triggerVerificationMail,
  logout,
  me,
} from "../controllers/auth.js";
import validateSession from "utils/validateSession.js";

const router: Router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/deactivate", validateSession, deactivateAccount);
router.get("/me", validateSession, me);

// incomplete, need frontend
router.route("/forgot-password").post();
router.post("/verify", validateSession, triggerVerificationMail);

export default router;
