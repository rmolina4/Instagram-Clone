import { Request, Response } from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import appError from "../utils/appError.js";
import * as postRepository from "../repositories/post.js";
import * as mediaHandler from "../utils/mediaHandler.js";
import db from "../db/db.js";

export const getPost = asyncWrapper(async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const post = await postRepository.getPost(req.account!.id, post_id);
  return res.status(200).json({
    success: true,
    post,
  });
});

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

export const createPost = asyncWrapper(async (req: Request, res: Response) => {
  const { body, location, hide_metrics, disable_comments } = req.body;
  const metadata = JSON.parse(req.body.metadata);
  const files = req.files as Express.Multer.File[];

  await db.transaction().execute(async (trx) => {
    const entity = await postRepository.createEntity(trx);
    const post = await postRepository.createPost(
      trx,
      req.account!.id,
      entity.id,
      body,
      location,
      hide_metrics,
      disable_comments
    );
    const media = await mediaHandler.createPost(post.id, files, metadata);
    await postRepository.createPostMedia(trx, post.id, media);
    return res.status(201).json({
      success: true,
      id: post.id,
      entity_id: entity.id,
    });
  });
});

export const editPost = asyncWrapper(async (req: Request, res: Response) => {
  const { post_id } = req.params;
  const { caption } = req.body;

  const post = await postRepository.getPost(req.account!.id, post_id);
  if (post.account_id != req.account!.id) {
    throw new appError("Access denied", 403);
  }
  await postRepository.editPost(post_id, caption);

  return res.status(200).json({
    success: true,
  });
});

export const createComment = asyncWrapper(
  async (req: Request, res: Response) => {
    const { post_id } = req.params;
    const { body, parent_id } = req.body;

    await db.transaction().execute(async (trx) => {
      const entity = await postRepository.createEntity(trx);
      const comment = await postRepository.createComment(
        trx,
        req.account!.id,
        entity.id,
        post_id,
        parent_id,
        body
      );

      return res.status(201).json({
        success: true,
        id: comment.id,
        entity_id: entity.id,
      });
    });
  }
);

export const editComment = asyncWrapper(async (req: Request, res: Response) => {
  const { comment_id } = req.params;
  const { body } = req.body;

  const comment = await postRepository.getComment(comment_id);
  if (comment.account_id != req.account!.id) {
    throw new appError("Access denied", 403);
  }
  await postRepository.editComment(comment_id, body);

  return res.status(200).json({
    success: true,
  });
});

export const likeEntity = asyncWrapper(async (req: Request, res: Response) => {
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
});

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

export const deleteEntity = asyncWrapper(
  async (req: Request, res: Response) => {
    const { entity_id } = req.params;

    await postRepository.deleteEntity(entity_id);

    return res.status(200).json({
      success: true,
    });
  }
);

export const getReplies = asyncWrapper(async (req: Request, res: Response) => {
  const { comment_id } = req.params;
  const cursor = req.query.cursor as string;

  const replies = await postRepository.getReplies(
    req.account!.id,
    comment_id,
    cursor
  );

  return res.status(200).json({
    success: true,
    replies: replies.reverse(),
  });
});
