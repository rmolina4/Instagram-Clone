import { jsonArrayFrom } from "kysely/helpers/postgres";
import db, { DB } from "../db/db.js";
import * as query from "../utils/query.js";
import { Transaction } from "kysely";

export const getPost = async (account_id: string, post_id: string) => {
  return await db
    .selectFrom("post")
    .innerJoin("account", "post.account_id", "account.id")
    .leftJoin("liked_entity", "liked_entity.entity_id", "post.entity_id")
    .leftJoin(
      "bookmarked_entity",
      "bookmarked_entity.entity_id",
      "post.entity_id"
    )
    .select((eb) => [
      "account.id",
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb
        .exists(
          db
            .selectFrom("follow")
            .where("account_id", "=", account_id)
            .where("followed_id", "=", eb.ref("post.account_id"))
        )
        .as("followed_by_me"),
      eb.fn
        .agg("bool_or", [eb("liked_entity.account_id", "=", account_id)])
        .as("liked_by_me"),
      eb.fn
        .agg("bool_or", [eb("bookmarked_entity.account_id", "=", account_id)])
        .as("bookmarked_by_me"),
      jsonArrayFrom(query.getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
      eb
        .cast(eb.fn.countAll("liked_entity").distinct(), "integer")
        .as("like_count"),
      jsonArrayFrom(
        eb
          .selectFrom("post_media")
          .select(["media_url", "mime_type"])
          .where("post_media.post_id", "=", eb.ref("post.id"))
      ).as("media"),
      eb("account.id", "=", account_id).as("is_owner"),
    ])
    .groupBy([
      "account.id",
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      "is_owner",
    ])
    .where("post.id", "=", post_id)
    .executeTakeFirstOrThrow();
};

export const getNextPosts = async (account_id: string, cursor?: string) => {
  return await db
    .selectFrom("post")
    .innerJoin("account", "post.account_id", "account.id")
    .leftJoin("liked_entity", "liked_entity.entity_id", "post.entity_id")
    .leftJoin("comment", "comment.post_id", "post.id")
    .leftJoin(
      "bookmarked_entity",
      "bookmarked_entity.entity_id",
      "post.entity_id"
    )
    .select((eb) => [
      "account.id",
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb
        .exists(
          db
            .selectFrom("follow")
            .where("account_id", "=", account_id)
            .where("followed_id", "=", eb.ref("post.account_id"))
        )
        .as("followed_by_me"),
      eb.fn
        .agg("bool_or", [eb("liked_entity.account_id", "=", account_id)])
        .as("liked_by_me"),
      eb.fn
        .agg("bool_or", [eb("bookmarked_entity.account_id", "=", account_id)])
        .as("bookmarked_by_me"),
      jsonArrayFrom(query.getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
      eb
        .cast(eb.fn.countAll("liked_entity").distinct(), "integer")
        .as("like_count"),
      jsonArrayFrom(
        eb
          .selectFrom("post_media")
          .select(["media_url", "mime_type"])
          .where("post_media.post_id", "=", eb.ref("post.id"))
      ).as("media"),
      eb("account.id", "=", account_id).as("is_owner"),
      eb
        .cast(eb.fn.countAll("comment").distinct(), "integer")
        .as("comment_count"),
    ])
    .groupBy([
      "account.id",
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      "is_owner",
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

export const getPostFromEntity = async (entity_id: string) => {
  return await db
    .selectFrom("post")
    .leftJoin("post_media", "post_media.post_id", "post.id")
    .select((eb) => [
      "post.id",
      eb.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
    ])
    .groupBy("post.id")
    .where("entity_id", "=", entity_id)
    .executeTakeFirst();
};

export const createEntity = async (trx: Transaction<DB>) => {
  return await trx
    .insertInto("entity")
    .defaultValues()
    .returning(["id"])
    .executeTakeFirstOrThrow();
};

export const createPost = async (
  trx: Transaction<DB>,
  account_id: string,
  entity_id: string,
  body: string,
  location: string,
  hide_metrics: boolean,
  disable_comments: boolean
) => {
  return await trx
    .insertInto("post")
    .values({
      account_id,
      entity_id,
      body,
      location,
      hide_metrics,
      disable_comments,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();
};

export const createPostMedia = async (
  trx: Transaction<DB>,
  post_id: string,
  media: { media_url: string; mime_type: string }[]
) => {
  return await trx
    .insertInto("post_media")
    .values(
      media.map((m) => ({
        post_id,
        media_url: m.media_url,
        mime_type: m.mime_type,
      }))
    )
    .execute();
};

export const deleteEntity = async (entity_id: string) => {
  return await db.deleteFrom("entity").where("id", "=", entity_id).execute();
};

export const editPost = async (post_id: string, body: string) => {
  return await db
    .updateTable("post")
    .set({ body })
    .where("id", "=", post_id)
    .execute();
};

export const createComment = async (
  trx: Transaction<DB>,
  account_id: string,
  entity_id: string,
  post_id: string,
  parent_id: string,
  body: string
) => {
  return await trx
    .insertInto("comment")
    .values({
      account_id,
      entity_id,
      post_id,
      parent_id,
      body,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();
};

export const getComment = async (comment_id: string) => {
  return await db
    .selectFrom("comment")
    .select(["account_id", "entity_id"])
    .where("id", "=", comment_id)
    .executeTakeFirstOrThrow();
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

export const getReplies = async (
  account_id: string,
  comment_id: string,
  cursor?: string
) => {
  return await db
    .withRecursive("comment_chain", (qb) => {
      return qb
        .selectFrom("comment")
        .selectAll()
        .where("comment.parent_id", "=", comment_id)
        .union(
          qb
            .selectFrom("comment")
            .innerJoin("comment_chain", "comment_chain.id", "comment.parent_id")
            .selectAll("comment")
        );
    })
    .selectFrom("comment_chain")
    .innerJoin("account", "comment_chain.account_id", "account.id")
    .leftJoin(
      "liked_entity",
      "liked_entity.entity_id",
      "comment_chain.entity_id"
    )
    .select((eb) => [
      "account.username",
      "comment_chain.id",
      "comment_chain.body",
      "comment_chain.created_at",
      "comment_chain.parent_id",
      "comment_chain.entity_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      eb
        .case()
        .when(eb.ref("liked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("liked_by_me"),
      eb("account.id", "=", account_id).as("is_owner"),
    ])
    .orderBy("comment_chain.created_at", "desc")
    .where(
      "comment_chain.created_at",
      "<",
      cursor == undefined ? new Date() : new Date(cursor)
    )
    .groupBy([
      "account.username",
      "comment_chain.id",
      "comment_chain.body",
      "comment_chain.created_at",
      "comment_chain.parent_id",
      "comment_chain.entity_id",
      "liked_entity.account_id",
      "is_owner",
    ])
    .limit(3)
    .execute();
};
