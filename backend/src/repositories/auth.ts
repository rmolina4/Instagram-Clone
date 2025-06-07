import db from "../db/db.js";

export const createAccount = async (
  username: string,
  password: string,
  email: string
) => {
  return await db
    .insertInto("account")
    .values({ username, password, email })
    .returning(["id"])
    .executeTakeFirstOrThrow();
};

export const createProfile = async (account_id: string, name: string) => {
  return await db.insertInto("profile").values({ account_id, name }).execute();
};

export const getAccountByUsernameOrEmail = async (identifier: string) => {
  return await db
    .selectFrom("account")
    .select(["id", "username", "email", "password"])
    .where((eb) =>
      eb.or([eb("username", "=", identifier), eb("email", "=", identifier)])
    )
    .executeTakeFirst();
};

export const createSession = async (
  id: string,
  account_id: string,
  expires_at: Date
) => {
  return await db
    .insertInto("session")
    .values({
      id,
      account_id,
      expires_at,
    })
    .returning(["id"])
    .execute();
};

export const deleteSession = async (sid: string) => {
  return await db.deleteFrom("session").where("id", "=", sid).execute();
};

export const deleteAccount = async (account_id: string) => {
  return await db.deleteFrom("account").where("id", "=", account_id).execute();
};

export const getAccountBySession = async (sid: string) => {
  return await db
    .selectFrom("session")
    .innerJoin("account", "account.id", "session.account_id")
    .innerJoin("profile", "profile.account_id", "account.id")
    .select([
      "account.id",
      "account.username",
      "account.email",
      "session.expires_at",
      "profile.name",
    ])
    .where("session.id", "=", sid)
    .executeTakeFirst();
};