import { jsonArrayFrom } from "kysely/helpers/postgres";
import db from "../db/db.js";
import * as query from "../utils/query.js";

export const getProfile = async (account_id: string, username: string) => {
  return await db
    .selectFrom("profile")
    .innerJoin("account", "profile.account_id", "account.id")
    .leftJoin("follow", (join) =>
      join.on((eb) =>
        eb.or([
          eb("follow.account_id", "=", eb.ref("account.id")),
          eb("follow.followed_id", "=", eb.ref("account.id")),
        ])
      )
    )
    .select([
      "account.username",
      "profile.name",
      "profile.bio",
      "profile.avatar_url",
      db.fn.count("follow.account_id").as("follower_count"),
      db.fn.count("follow.followed_id").as("following_count"),
      jsonArrayFrom(query.getNextAccountPosts(account_id, username)).as(
        "posts"
      ),
      jsonArrayFrom(query.getNextLikedPosts(account_id, username)).as(
        "liked_posts"
      ),
      jsonArrayFrom(query.getNextBookmarkedPosts(account_id, username)).as(
        "bookmarked_posts"
      ),
    ])
    .groupBy([
      "account.username",
      "profile.name",
      "profile.bio",
      "profile.avatar_url",
    ])
    .where("account.username", "=", username)
    .execute();
};

export const editProfile = async (
  username: string,
  name?: string,
  bio?: string,
  avatar_url?: string
) => {
  const updateData: Record<string, string> = {};

  if (name !== undefined) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

  if (Object.keys(updateData).length === 0) {
    return;
  }

  return await db
    .updateTable("profile")
    .innerJoin("account", "account.id", "profile.account_id")
    .set(updateData)
    .where("account.username", "=", username)
    .execute();
};

export const getNextAccountPosts = async (
  account_id: string,
  username: string,
  cursor?: string
) => {
  return await query
    .getNextAccountPosts(account_id, username, cursor)
    .execute();
};

export const getNextLikedPosts = async (
  account_id: string,
  username: string,
  cursor?: string
) => {
  return await query.getNextLikedPosts(account_id, username, cursor).execute();
};

export const getNextBookmarkedPosts = async (
  account_id: string,
  username: string,
  cursor?: string
) => {
  return await query
    .getNextBookmarkedPosts(account_id, username, cursor)
    .execute();
};

export const createFollow = async (account_id: string, followed_id: string) => {
  return await db
    .insertInto("follow")
    .values({
      account_id,
      followed_id,
    })
    .execute();
};

export const deleteFollow = async (account_id: string, followed_id: string) => {
  return await db
    .deleteFrom("follow")
    .where((eb) =>
      eb.and([
        eb("account_id", "=", account_id),
        eb("followed_id", "=", followed_id),
      ])
    )
    .execute();
};

export const createMessage = async (
  account_id: string,
  receiver_id: string,
  body: string
) => {
  return await db
    .insertInto("message")
    .values({
      account_id,
      receiver_id,
      body,
    })
    .execute();
};

export const getMessage = async (message_id: string) => {
  return await db
    .selectFrom("message")
    .select("account_id")
    .where("id", "=", message_id)
    .executeTakeFirstOrThrow();
};

export const deleteMessage = async (message_id: string) => {
  return await db.deleteFrom("message").where("id", "=", message_id).execute();
};

export const editMessage = async (message_id: string, body: string) => {
  return await db
    .updateTable("message")
    .where("id", "=", message_id)
    .set({ body })
    .execute();
};

export const getMessages = async (account_id: string, receiver_id: string) => {
  return await db
    .selectFrom("message")
    .selectAll()
    .where((eb) =>
      eb.or([
        eb.and([
          eb("account_id", "=", account_id),
          eb("receiver_id", "=", receiver_id),
        ]),
        eb.and([
          eb("account_id", "=", receiver_id),
          eb("receiver_id", "=", account_id),
        ]),
      ])
    )
    .orderBy("created_at", "desc")
    .execute();
};

export const getAccountByUsername = async (username: string) => {
  return await db
    .selectFrom("account")
    .select("id")
    .where("username", "=", username)
    .executeTakeFirstOrThrow();
};

export const getAccountByEmail = async (email: string) => {
  return await db
    .selectFrom("account")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirstOrThrow();
};
