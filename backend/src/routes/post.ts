import express, { Router } from "express";
import {
  createPost,
  getNextPosts,
  getPost,
  editPost,
  deletePost,
  createComment,
  deleteComment,
  editComment,
  likeEntity,
  bookmarkEntity,
} from "controllers/post";
import validateSession from "utils/validateSession.js";

const router: Router = express.Router();
router.post("/", validateSession, createPost);
router.get("/next", validateSession, getNextPosts);
router
  .route("/:post_id")
  .get(validateSession, getPost)
  .delete(validateSession, deletePost)
  .put(validateSession, editPost)
  .post(validateSession, createComment);
router
  .route("/comments/:comment_id")
  .delete(validateSession, deleteComment)
  .put(validateSession, editComment);
router
  .route("/:entity_id/action")
  .post(validateSession, bookmarkEntity)
  .put(validateSession, likeEntity);

export default router;
