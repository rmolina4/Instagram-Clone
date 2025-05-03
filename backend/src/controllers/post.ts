import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import db from "../db/db.js";
import appError from "../utils/appError.js";

export const getPost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { post_id } = req.params;

    const post = await db
      .selectFrom("post")
      .innerJoin("account", "post.account_id", "account.id")
      .innerJoin("comment", "post.id", "comment.post_id")
      .leftJoin("liked_entity", (join) =>
        join
          .onRef("liked_entity.entity_id", "=", "post.entity_id")
          .on("liked_entity.account_id", "=", req.account!.id)
      )
      .leftJoin("bookmarked_entity", (join) =>
        join
          .onRef("bookmarked_entity.entity_id", "=", "post.entity_id")
          .on("bookmarked_entity.account_id", "=", req.account!.id)
      )
      .select([
        "account.username",
        "post.id",
        "post.caption",
        "post.created_at",
        "post.entity_id",
      ])
      .where("post.id", "=", post_id)
      .executeTakeFirstOrThrow();

    return res.status(200).json({
      success: true,
      post,
    });
  }
);

export const getNextPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const cursor = req.query.cursor as string | undefined;

    const posts = await db
      .selectFrom("post")
      .innerJoin("account", "post.account_id", "account.id")
      .leftJoin("liked_entity", (join) =>
        join
          .onRef("liked_entity.entity_id", "=", "post.entity_id")
          .on("liked_entity.account_id", "=", req.account!.id)
      )
      .leftJoin("bookmarked_entity", (join) =>
        join
          .onRef("bookmarked_entity.entity_id", "=", "post.entity_id")
          .on("bookmarked_entity.account_id", "=", req.account!.id)
      )
      .select([
        "account.username",
        "post.id",
        "post.caption",
        "post.created_at",
        "post.entity_id",
      ])
      .where(
        "post.created_at",
        "<",
        cursor == undefined ? new Date() : new Date(cursor)
      )
      .limit(10)
      .orderBy("post.created_at desc")
      .execute();

    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const createPost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { caption } = req.body;

    const entity = await db
      .insertInto("entity")
      .returning(["id"])
      .executeTakeFirstOrThrow();
    const post = await db
      .insertInto("post")
      .values({
        account_id: req.account!.id,
        entity_id: entity.id,
        caption,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();

    return res.status(201).json({
      success: true,
      id: post.id,
    });
  }
);

export const deletePost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { post_id } = req.params;

    const post = await db
      .selectFrom("post")
      .select("account_id")
      .where("id", "=", post_id)
      .executeTakeFirstOrThrow();
    if (post.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await db.deleteFrom("post").where("id", "=", post_id).execute();

    return res.status(204).json({
      success: true,
    });
  }
);

export const editPost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { post_id } = req.params;
    const { caption } = req.body;

    const post = await db
      .selectFrom("post")
      .select("account_id")
      .where("id", "=", post_id)
      .executeTakeFirstOrThrow();
    if (post.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await db
      .updateTable("post")
      .set({
        caption,
      })
      .where("id", "=", post_id)
      .execute();

    return res.status(200).json({
      success: true,
    });
  }
);

export const createComment = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { post_id } = req.params;
    const { body, parent_id } = req.body;

    const entity = await db
      .insertInto("entity")
      .returning(["id"])
      .executeTakeFirstOrThrow();
    await db
      .insertInto("comment")
      .values({
        account_id: req.account!.id,
        entity_id: entity.id,
        post_id,
        parent_id,
        body,
      })
      .execute();

    return res.status(201).json({
      success: true,
    });
  }
);

export const deleteComment = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;

    const comment = await db
      .selectFrom("comment")
      .select("account_id")
      .where("id", "=", comment_id)
      .executeTakeFirstOrThrow();
    if (comment.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await db.deleteFrom("comment").where("id", "=", comment_id).execute();

    return res.status(204).json({
      success: true,
    });
  }
);

export const editComment = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { comment_id } = req.params;
    const { body } = req.body;

    const comment = await db
      .selectFrom("comment")
      .select("account_id")
      .where("id", "=", comment_id)
      .executeTakeFirstOrThrow();
    if (comment.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }
    await db
      .updateTable("comment")
      .set({
        body,
      })
      .where("id", "=", comment_id)
      .execute();

    return res.status(200).json({
      success: true,
    });
  }
);

export const likeEntity = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { entity_id } = req.params;
    let status = 201;

    try {
      await db
        .insertInto("liked_entity")
        .values({
          account_id: req.account!.id,
          entity_id,
        })
        .execute();
    } catch (err: any) {
      if (err.code === "23503") {
        throw new appError("Post not found", 404);
      }
      status = 204;
      await db
        .deleteFrom("liked_entity")
        .where((eb) =>
          eb.and([
            eb("entity_id", "=", entity_id),
            eb("account_id", "=", req.account!.id),
          ])
        )
        .execute();
    }

    return res.status(status).json({
      success: true,
    });
  }
);

export const bookmarkEntity = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { entity_id } = req.params;
    let status = 201;

    try {
      await db
        .insertInto("bookmarked_entity")
        .values({
          account_id: req.account!.id,
          entity_id,
        })
        .execute();
    } catch (err: any) {
      if (err.code === "23503") {
        throw new appError("Post not found", 404);
      }
      status = 204;
      await db
        .deleteFrom("bookmarked_entity")
        .where((eb) =>
          eb.and([
            eb("entity_id", "=", entity_id),
            eb("account_id", "=", req.account!.id),
          ])
        )
        .execute();
    }

    return res.status(status).json({
      success: true,
    });
  }
);
