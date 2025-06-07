import db from "../db/db.js";
import { Expression, ExpressionBuilder } from "kysely";
import { DB } from "types/db";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export function likedByMe(
  eb: ExpressionBuilder<DB, keyof DB>,
  account_id: string,
  entity_id: Expression<string>
) {
  return eb
    .exists(
      db
        .selectFrom("liked_entity")
        .where("liked_entity.account_id", "=", account_id)
        .where("liked_entity.entity_id", "=", entity_id)
    )
    .as("liked_by_me");
}

export function bookmarkedByMe(
  eb: ExpressionBuilder<DB, keyof DB>,
  account_id: string,
  entity_id: Expression<string>
) {
  return eb
    .exists(
      db
        .selectFrom("bookmarked_entity")
        .where("bookmarked_entity.account_id", "=", account_id)
        .where("bookmarked_entity.entity_id", "=", entity_id)
    )
    .as("bookmarked_by_me");
}

export function getPostComments(
  account_id: string,
  post_id: Expression<string> | string,
  cursor?: string
) {
  return db
    .selectFrom("comment")
    .innerJoin("account", "comment.account_id", "account.id")
    .leftJoin("liked_entity", "liked_entity.entity_id", "comment.entity_id")
    .where((eb) =>
      eb.and([
        eb("comment.post_id", "=", post_id),
        eb(
          "comment.created_at",
          "<",
          cursor == undefined ? new Date() : new Date(cursor)
        ),
      ])
    )
    .select((eb) => [
      "comment.id",
      "comment.body",
      "account.username",
      "comment.created_at",
      "comment.parent_id",
      "comment.entity_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      likedByMe(eb, account_id, eb.ref("comment.entity_id")),
    ])
    .groupBy([
      "comment.id",
      "comment.body",
      "account.username",
      "comment.created_at",
      "comment.parent_id",
      "comment.entity_id",
    ])
    .orderBy("comment.created_at", "desc")
}

export function getNextLikedPosts(
  account_id: string,
  username: string,
  cursor?: string
) {
  return db
    .selectFrom("post")
    .innerJoin("account", "post.account_id", "account.id")
    .innerJoin("liked_entity", (join) =>
      join.on("liked_entity.account_id", "=", account_id)
    )
    .leftJoin("post_media", "post.id", "post_media.post_id")
    .select((eb) => [
      "account.username",
      "post.id",
      "post.caption",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      likedByMe(eb, account_id, eb.ref("post.entity_id")),
      bookmarkedByMe(eb, account_id, eb.ref("post.entity_id")),
      jsonArrayFrom(getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
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
    .where("account.username", "=", username)
    .limit(10)
    .orderBy("post.created_at", "desc");
}

export function getNextBookmarkedPosts(
  account_id: string,
  username: string,
  cursor?: string
) {
  return db
    .selectFrom("post")
    .innerJoin("account", "post.account_id", "account.id")
    .innerJoin("bookmarked_entity", (join) =>
      join.on("bookmarked_entity.account_id", "=", account_id)
    )
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
      likedByMe(eb, account_id, eb.ref("post.entity_id")),
      bookmarkedByMe(eb, account_id, eb.ref("post.entity_id")),
      jsonArrayFrom(getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
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
    .where("account.username", "=", username)
    .limit(10)
    .orderBy("post.created_at", "desc");
}

export function getNextAccountPosts(
  account_id: string,
  username: string,
  cursor?: string
) {
  return db
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
      likedByMe(eb, account_id, eb.ref("post.entity_id")),
      bookmarkedByMe(eb, account_id, eb.ref("post.entity_id")),
      jsonArrayFrom(getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
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
    .where("account.username", "=", username)
    .limit(10)
    .orderBy("post.created_at", "desc");
}
