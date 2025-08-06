import db from "../db/db.js";
import { Expression } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export function getPostComments(
  account_id: string,
  post_id: Expression<string> | string,
  cursor?: string
) {
  return db
    .withRecursive("comment_chain", (qb) => {
      return qb
        .selectFrom("comment")
        .select(["comment.id as root_id", "comment.id"])
        .where((eb) =>
          eb.and([
            eb("comment.post_id", "=", post_id),
            eb("comment.parent_id", "is", null),
            eb("comment.id", ">", cursor == undefined ? "-1" : cursor),
          ])
        )
        .union(
          qb
            .selectFrom("comment")
            .innerJoin("comment_chain", "comment_chain.id", "comment.parent_id")
            .select(["comment_chain.root_id", "comment.id"])
        );
    })
    .selectFrom("comment_chain")
    .innerJoin("comment", "comment.id", "comment_chain.root_id")
    .innerJoin("account", "comment.account_id", "account.id")
    .leftJoin("liked_entity", "liked_entity.entity_id", "comment.entity_id")
    .selectAll("comment")
    .select((eb) => [
      "account.username",
      eb
        .cast(eb.fn.countAll("liked_entity").distinct(), "integer")
        .as("like_count"),
      eb.fn
        .agg("bool_or", [eb("liked_entity.account_id", "=", account_id)])
        .as("liked_by_me"),
      eb("account.id", "=", account_id).as("is_owner"),
      eb(eb.cast(eb.fn.count("comment_chain.id"), "integer"), "-", "1").as(
        "reply_count"
      ),
    ])
    .groupBy([
      "account.id",
      "liked_entity.account_id",
      "account.username",
      "comment.id",
      "comment.body",
      "comment.created_at",
      "comment.parent_id",
      "comment.entity_id",
      "comment.account_id",
      "comment.post_id",
      "root_id",
    ])
    .orderBy("comment.created_at", "asc")
    .limit(10);
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
    .leftJoin(
      "bookmarked_entity",
      "bookmarked_entity.entity_id",
      "post.entity_id"
    )
    .select((eb) => [
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      eb
        .case()
        .when(eb.ref("liked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("liked_by_me"),
      eb
        .case()
        .when(eb.ref("bookmarked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("bookmarked_by_me"),
      jsonArrayFrom(getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
      eb.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
      eb("account.id", "=", account_id).as("is_owner"),
    ])
    .groupBy([
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      "liked_entity.account_id",
      "bookmarked_entity.account_id",
      "is_owner",
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
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      eb
        .case()
        .when(eb.ref("liked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("liked_by_me"),
      eb
        .case()
        .when(eb.ref("bookmarked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("bookmarked_by_me"),
      jsonArrayFrom(getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
      eb.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
      eb("account.id", "=", account_id).as("is_owner"),
    ])
    .groupBy([
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      "liked_entity.account_id",
      "bookmarked_entity.account_id",
      "is_owner",
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
    .leftJoin(
      "bookmarked_entity",
      "bookmarked_entity.entity_id",
      "post.entity_id"
    )
    .leftJoin("post_media", "post.id", "post_media.post_id")
    .select((eb) => [
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      eb.cast(eb.fn.count("liked_entity.id"), "integer").as("like_count"),
      eb
        .case()
        .when(eb.ref("liked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("liked_by_me"),
      eb
        .case()
        .when(eb.ref("bookmarked_entity.account_id"), "=", account_id)
        .then(true)
        .else(false)
        .end()
        .as("bookmarked_by_me"),
      jsonArrayFrom(getPostComments(account_id, eb.ref("post.id"))).as(
        "comments"
      ),
      eb.fn.agg("array_agg", ["post_media.media_url"]).as("media_urls"),
      eb("account.id", "=", account_id).as("is_owner"),
    ])
    .groupBy([
      "account.username",
      "post.id",
      "post.body",
      "post.created_at",
      "post.entity_id",
      "post.account_id",
      "liked_entity.account_id",
      "bookmarked_entity.account_id",
      "is_owner",
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
