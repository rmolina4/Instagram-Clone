import {
  editProfile,
  getNextAccountPosts,
  getNextBookmarkedPosts,
  getNextLikedPosts,
  getProfile,
  getMessages,
  editMessage,
  deleteMessage,
  isUsernameAvailable,
  isEmailAvailable,
} from "../controllers/account.js";
import express, { Router } from "express";
import validateSession from "../utils/validateSession.js";

const router: Router = express.Router();
router
  .route("/:username/profile")
  .get(validateSession, getProfile)
  .put(validateSession, editProfile);
router.get("/:account_id/posts", validateSession, getNextAccountPosts);
router.get("/:account_id/bookmarked", validateSession, getNextBookmarkedPosts);
router.get("/:account_id/liked", validateSession, getNextLikedPosts);
router.post("/:account_id/follow");
router.route("/:account_id/messages").get(validateSession, getMessages);
router
  .route("/messages/:message_id")
  .put(validateSession, editMessage)
  .delete(validateSession, deleteMessage);
router.post("/is-username-available", isUsernameAvailable);
router.post("/is-email-available", isEmailAvailable);
export default router;
