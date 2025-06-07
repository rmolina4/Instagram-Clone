import { jsonArrayFrom } from "kysely/helpers/postgres";
import db from "../db/db.js";
import * as query from "../utils/query.js";

export const getPost = async (account_id: string, post_id: string) => {
  return await db
    .selectFrom("post")
    .innerJoin("account", "post.account_id", "account.id")
    .leftJoin("liked_entity", "liked_entity.entity_id", "post.entity_id")
    .leftJoin("post_media", "post.id", "post_media.post_id")
    .select((eb) => [
      "account.username",
      "post.id",
      "post.caption",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      query.likedByMe(eb, account_id, eb.ref("post.entity_id")),
      query.bookmarkedByMe(eb, account_id, eb.ref("post.entity_id")),
      jsonArrayFrom(
        query.getPostComments(account_id, eb.ref("post.id"))
      ).as("comments"),
      db.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
    ])
    .groupBy([
      "account.username",
      "post.id",
      "post.caption",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
    ])
    .where("post.id", "=", post_id)
    .executeTakeFirstOrThrow();
};

export const getNextPosts = async (account_id: string, cursor?: string) => {
  return await db
    .selectFrom("post")
    .innerJoin("account", "post.account_id", "account.id")
    .leftJoin("liked_entity", "liked_entity.entity_id", "post.entity_id")
    .leftJoin("post_media", "post.id", "post_media.post_id")
    .select((eb) => [
      "account.username",
      "post.id",
      "post.caption",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      query.likedByMe(eb, account_id, eb.ref("post.entity_id")),
      query.bookmarkedByMe(eb, account_id, eb.ref("post.entity_id")),
      jsonArrayFrom(
        query.getPostComments(account_id, eb.ref("post.id"))
      ).as("comments"),
      db.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
    ])
    .groupBy([
      "account.username",
      "post.id",
      "post.caption",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
    ])
    .where(
      "post.created_at",
      "<",
      cursor == undefined ? new Date() : new Date(cursor)
    )
    .orderBy("post.created_at", "desc")
    .limit(10)
    .execute();
};

export const createEntity = async () => {
  return await db
    .insertInto("entity")
    .defaultValues()
    .returning(["id"])
    .executeTakeFirstOrThrow();
};

export const createPost = async (
  account_id: string,
  entity_id: string,
  caption: string
) => {
  return await db
    .insertInto("post")
    .values({
      account_id,
      entity_id,
      caption,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export const createPostMedia = async (
  post_id: string,
  media_urls: string[]
) => {
  return await db
    .insertInto("post_media")
    .values(media_urls.map((media_url) => ({ post_id, media_url })))
    .execute();
};

export const deletePost = async (post_id: string) => {
  return await db.deleteFrom("post").where("id", "=", post_id).execute();
};

export const editPost = async (post_id: string, caption: string) => {
  return await db
    .updateTable("post")
    .set({ caption })
    .where("id", "=", post_id)
    .execute();
};

export const createComment = async (
  account_id: string,
  entity_id: string,
  post_id: string,
  parent_id: string,
  body: string
) => {
  return await db
    .insertInto("comment")
    .values({
      account_id,
      entity_id,
      post_id,
      parent_id,
      body,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export const getComment = async (comment_id: string) => {
  return await db
    .selectFrom("comment")
    .select("account_id")
    .where("id", "=", comment_id)
    .executeTakeFirstOrThrow();
};

export const deleteComment = async (comment_id: string) => {
  return await db.deleteFrom("comment").where("id", "=", comment_id).execute();
};

export const editComment = async (comment_id: string, body: string) => {
  return await db
    .updateTable("comment")
    .set({ body })
    .where("id", "=", comment_id)
    .execute();
};

export const createLike = async (account_id: string, entity_id: string) => {
  return await db
    .insertInto("liked_entity")
    .values({ account_id, entity_id })
    .execute();
};

export const deleteLike = async (account_id: string, entity_id: string) => {
  return await db
    .deleteFrom("liked_entity")
    .where((eb) =>
      eb.and([
        eb("entity_id", "=", entity_id),
        eb("account_id", "=", account_id),
      ])
    )
    .execute();
};

export const createBookmark = async (account_id: string, entity_id: string) => {
  return await db
    .insertInto("bookmarked_entity")
    .values({
      account_id,
      entity_id,
    })
    .execute();
};

export const deleteBookmark = async (account_id: string, entity_id: string) => {
  return await db
    .deleteFrom("bookmarked_entity")
    .where((eb) =>
      eb.and([
        eb("entity_id", "=", entity_id),
        eb("account_id", "=", account_id),
      ])
    )
    .execute();
};

export const getNextComments = async (
  account_id: string,
  post_id: string,
  cursor?: string
) => {
  return await query.getPostComments(account_id, post_id, cursor).execute();
};
