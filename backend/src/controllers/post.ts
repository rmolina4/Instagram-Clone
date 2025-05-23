import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import db, { supabase } from "../db/db.js";
import appError from "../utils/appError.js";

export const getPost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { post_id } = req.params;

    let post = await db
      .selectFrom("post")
      .innerJoin("account", "post.account_id", "account.id")
      .innerJoin("comment", "post.id", "comment.post_id")
      .leftJoin("liked_entity", (join) =>
        join.onRef("liked_entity.entity_id", "=", "post.entity_id")
      )
      .leftJoin("post_media", "post.id", "post_media.post_id")
      .select((eb) => [
        "account.username",
        "post.caption",
        "post.created_at",
        eb.fn.count("liked_entity.id").as("like_count"),
        eb
          .exists(
            db
              .selectFrom("liked_entity")
              .where("liked_entity.account_id", "=", req.account!.id)
              .where("liked_entity.entity_id", "=", eb.ref("post.entity_id"))
          )
          .as("liked_by_me"),
        eb
          .exists(
            db
              .selectFrom("bookmarked_entity")
              .where("bookmarked_entity.account_id", "=", req.account!.id)
              .where("bookmarked_entity.entity_id", "=", eb.ref("post.entity_id"))
          )
          .as("bookmarked_by_me"),
        db.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
      ])
      .groupBy([
        "post.id",
        "post.entity_id",
        "account.username",
        "post.id",
        "post.caption",
        "post.created_at",
        "post.entity_id",
        "liked_by_me",
        "bookmarked_by_me",
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

    let posts = await db
      .selectFrom("post")
      .innerJoin("account", "post.account_id", "account.id")
      .leftJoin("liked_entity", (join) =>
        join.onRef("liked_entity.entity_id", "=", "post.entity_id")
      )
      .leftJoin("post_media", "post.id", "post_media.post_id")
      .select((eb) => [
        "account.username",
        "post.id",
        "post.caption",
        "post.created_at",
        "post.entity_id",
        eb.fn.count("liked_entity.id").as("like_count"),
        eb
          .exists(
            db
              .selectFrom("liked_entity")
              .where("liked_entity.account_id", "=", req.account!.id)
              .where("liked_entity.entity_id", "=", eb.ref("post.entity_id"))
          )
          .as("liked_by_me"),
        eb
          .exists(
            db
              .selectFrom("bookmarked_entity")
              .where("bookmarked_entity.account_id", "=", req.account!.id)
              .where("bookmarked_entity.entity_id", "=", eb.ref("post.entity_id"))
          )
          .as("bookmarked_by_me"),
        db.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
      ])
      .groupBy([
        "post.id",
        "post.entity_id",
        "account.username",
        "post.id",
        "post.caption",
        "post.created_at",
        "post.entity_id",
        "liked_by_me",
        "bookmarked_by_me",
      ])
      .where(
        "post.created_at",
        "<",
        cursor == undefined ? new Date() : new Date(cursor)
      )
      .limit(10)
      .orderBy("post.created_at", "desc")
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
    const media = req.files as Express.Multer.File[];

    const entity = await db
      .insertInto("entity")
      .defaultValues()
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

    for (const [index, file] of media.entries()) {
      const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME!)
        .upload(`posts/${post.id}/${index}`, file.buffer, {
          contentType: file.mimetype,
        });
      if (error) {
        throw new appError("Failed to upload media", 500);
      }
    }

    await db
      .insertInto("post_media")
      .values(
        media.map((_, index) => ({
          post_id: post.id,
          media_url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/posts/${post.id}/${index}`,
        }))
      )
      .execute();

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
