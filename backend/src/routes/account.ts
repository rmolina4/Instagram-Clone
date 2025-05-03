import {
  editProfile,
  getAccountPosts,
  getBookmakedPosts,
  getLikedPosts,
  getProfile,
  me,
  getMessages,
  editMessage,
  deleteMessage,
} from "controllers/account";
import express, { Router } from "express";
import validateSession from "utils/validateSession";

const router: Router = express.Router();
router
  .route("/:account_id/profile")
  .get(validateSession, getProfile)
  .put(validateSession, editProfile);
router.get("/:account_id/posts", validateSession, getAccountPosts);
router.get("/:account_id/bookmarked", validateSession, getBookmakedPosts);
router.get("/:account_id/liked", validateSession, getLikedPosts);
router.get("/me", validateSession, me);
router.post("/:account_id/follow");
router.route("/:account_id/messages").get(validateSession, getMessages);
router
  .route("/messages/:message_id")
  .put(validateSession, editMessage)
  .delete(validateSession, deleteMessage);

export default router;
