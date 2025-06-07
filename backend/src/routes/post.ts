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
  getNextComments,
} from "../controllers/post.js";
import validateSession from "../utils/validateSession.js";
import multer from "multer";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", validateSession, upload.array("media"), createPost);
router.get("/next", validateSession, getNextPosts);
router
  .route("/:post_id")
  .get(validateSession, getPost)
  .delete(validateSession, deletePost)
  .put(validateSession, editPost)
  .post(validateSession, createComment);
router.route("/:post_id/comments").get(validateSession, getNextComments);
router
  .route("/comments/:comment_id")
  .delete(validateSession, deleteComment)
  .put(validateSession, editComment);
router
  .route("/:entity_id/action")
  .post(validateSession, bookmarkEntity)
  .put(validateSession, likeEntity);

export default router;
