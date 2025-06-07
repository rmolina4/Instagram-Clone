import { Request, Response } from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import appError from "../utils/appError.js";
import * as postRepository from "../repositories/post.js";
import * as uploadMedia from "../utils/uploadMedia.js";

export const getPost = asyncWrapper(
  async (req: Request, res: Response) => {
    const { post_id } = req.params;
    const post = await postRepository.getPost(req.account!.id, post_id);
    return res.status(200).json({
      success: true,
      post,
    });
  }
);

export const getNextPosts = asyncWrapper(
  async (req: Request, res: Response) => {
    const cursor = req.query.cursor as string;
    const posts = await postRepository.getNextPosts(req.account!.id, cursor);
    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const createPost = asyncWrapper(
  async (req: Request, res: Response) => {
    const { caption } = req.body;
    const media = req.files as Express.Multer.File[];

    const entity = await postRepository.createEntity();
    const post = await postRepository.createPost(
      req.account!.id,
      entity.id,
      caption
    );
    const media_urls = await uploadMedia.post(media, post.id);
    await postRepository.createPostMedia(post.id, media_urls);

    return res.status(201).json({
      success: true,
      post: {
        ...post,
        media_urls,
        username: req.account!.username,
        comments: [],
        liked_by_me: false,
        bookmarked_by_me: false,
        like_count: 0,
      },
    });
  }
);

export const deletePost = asyncWrapper(
  async (req: Request, res: Response) => {
    const { post_id } = req.params;

    const post = await postRepository.getPost(req.account!.id, post_id);
    if (post.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await postRepository.deletePost(post_id);

    return res.status(200).json({
      success: true,
    });
  }
);

export const editPost = asyncWrapper(
  async (req: Request, res: Response) => {
    const { post_id } = req.params;
    const { caption } = req.body;

    const post = await postRepository.getPost(req.account!.id, post_id);
    if (post.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await postRepository.editPost(post_id, caption);

    return res.status(200).json({
      success: true,
    });
  }
);

export const createComment = asyncWrapper(
  async (req: Request, res: Response) => {
    const { post_id } = req.params;
    const { body, parent_id } = req.body;

    const entity = await postRepository.createEntity();
    const comment = await postRepository.createComment(
      req.account!.id,
      entity.id,
      post_id,
      parent_id,
      body
    );

    return res.status(201).json({
      success: true,
      comment: {
        ...comment,
        username: req.account!.username,
        liked_by_me: false,
        like_count: 0,
      },
    });
  }
);

export const deleteComment = asyncWrapper(
  async (req: Request, res: Response) => {
    const { comment_id } = req.params;

    const comment = await postRepository.getComment(comment_id);
    if (comment.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await postRepository.deleteComment(comment_id);

    return res.status(200).json({
      success: true,
    });
  }
);

export const editComment = asyncWrapper(
  async (req: Request, res: Response) => {
    const { comment_id } = req.params;
    const { body } = req.body;

    const comment = await postRepository.getComment(comment_id);
    if (comment.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await postRepository.editComment(comment_id, body);

    return res.status(200).json({
      success: true,
    });
  }
);

export const likeEntity = asyncWrapper(
  async (req: Request, res: Response) => {
    const { entity_id } = req.params;
    let status = 201;

    try {
      await postRepository.createLike(req.account!.id, entity_id);
    } catch (err: unknown) {
      if ((err as appError).code === "23503") {
        throw new appError("Post not found", 404);
      }
      await postRepository.deleteLike(req.account!.id, entity_id);
      status = 200;
    }

    return res.status(status).json({
      success: true,
    });
  }
);

export const bookmarkEntity = asyncWrapper(
  async (req: Request, res: Response) => {
    const { entity_id } = req.params;
    let status = 201;

    try {
      await postRepository.createBookmark(req.account!.id, entity_id);
    } catch (err: unknown) {
      if ((err as appError).code === "23503") {
        throw new appError("Post not found", 404);
      }
      await postRepository.deleteBookmark(req.account!.id, entity_id);
      status = 200;
    }

    return res.status(status).json({
      success: true,
    });
  }
);

export const getNextComments = asyncWrapper(
  async (req: Request, res: Response) => {
    const { post_id } = req.params;
    const cursor = req.query.cursor as string;

    const comments = await postRepository.getNextComments(
      req.account!.id,
      post_id,
      cursor
    );

    return res.status(200).json({
      success: true,
      comments,
    });
  }
);
