import express, { Router } from "express";
import {
  createPost,
  getNextPosts,
  getPost,
  editPost,
  createComment,
  editComment,
  likeEntity,
  bookmarkEntity,
  getNextComments,
  deleteEntity,
  getReplies,
} from "../controllers/post.js";
import validateSession from "../utils/validateSession.js";
import multer from "multer";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", validateSession, upload.array("files"), createPost);
router.get("/next", validateSession, getNextPosts);
router
  .route("/:post_id")
  .get(validateSession, getPost)
  .put(validateSession, editPost)
  .post(validateSession, createComment);
router.route("/:post_id/comments").get(validateSession, getNextComments);
router
  .route("/comments/:comment_id")
  .put(validateSession, editComment)
  .get(validateSession, getReplies);
router
  .route("/:entity_id/action")
  .post(validateSession, bookmarkEntity)
  .put(validateSession, likeEntity)
  .delete(validateSession, deleteEntity);

export default router;
