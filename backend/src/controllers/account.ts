import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import appError from "../utils/appError.js";
import db from "../db/db.js";

export const getProfile = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;

    const profile = await db
      .selectFrom("profile")
      .selectAll()
      .leftJoin("follow", (join) =>
        join.on("follow.followed_id", "=", account_id)
      )
      .leftJoin("follow", (join) =>
        join.on("follow.account_id", "=", account_id)
      )
      .where("account_id", "=", account_id)
      .executeTakeFirstOrThrow();

    return res.status(200).json({
      success: true,
      profile,
    });
  }
);

export const editProfile = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;
    const { name, bio } = req.body;
    if (req.account!.id != account_id) {
      throw new appError("Invalid credentials", 401);
    }

    await db
      .updateTable("profile")
      .set({
        name,
        bio,
      })
      .where("account_id", "=", account_id)
      .execute();

    return res.status(200).json({
      success: true,
    });
  }
);

export const getAccountPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;

    const posts = await db
      .selectFrom("post")
      .where("account_id", "=", account_id)
      .execute();

    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const getLikedPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;

    const posts = await db
      .selectFrom("liked_entity")
      .innerJoin("post", "liked_entity.id", "post.entity_id")
      .where("liked_entity.account_id", "=", account_id)
      .execute();

    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const getBookmakedPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;

    const posts = await db
      .selectFrom("bookmarked_entity")
      .innerJoin("post", "bookmarked_entity.id", "post.entity_id")
      .where("bookmarked_entity.account_id", "=", account_id)
      .execute();

    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const followAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;
    let status = 201;

    try {
      await db
        .insertInto("follow")
        .values({
          account_id: req.account!.id,
          followed_id: account_id,
        })
        .execute();
    } catch (err: any) {
      if (err.code === "") {
        throw new appError("Account not found", 404);
      }
      status = 204;
      await db
        .deleteFrom("follow")
        .where((eb) =>
          eb.and({
            account_id: req.account!.id,
            following_id: account_id,
          })
        )
        .execute();
    }

    return res.status(status).json({
      success: true,
    });
  }
);

export const createMessage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;
    const { body } = req.body;

    await db
      .insertInto("message")
      .values({
        account_id: req.account!.id,
        receiver_id: account_id,
        body,
      })
      .execute();

    return res.status(200).json({
      success: true,
    });
  }
);

export const deleteMessage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message_id } = req.params;

    const message = await db
      .selectFrom("message")
      .select("account_id")
      .where("id", "=", message_id)
      .executeTakeFirstOrThrow();

    if (message.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }

    await db.deleteFrom("message").where("message.id", "=", message_id);

    return res.status(204).json({
      success: true,
    });
  }
);

export const editMessage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message_id } = req.params;
    const { body } = req.body;

    const message = await db
      .selectFrom("message")
      .select("account_id")
      .where("id", "=", message_id)
      .executeTakeFirstOrThrow();

    if (message.account_id != req.account!.id) {
      throw new appError("Invalid credentials", 401);
    }

    await db.updateTable("message").where("message.id", "=", message_id).set({
      body,
    });

    return res.status(200).json({
      success: true,
    });
  }
);

export const getMessages = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { account_id } = req.params;

    const messages = await db
      .selectFrom("message")
      .selectAll()
      .where((eb) =>
        eb.and([
          eb("account_id", "=", req.account!.id),
          eb("receiver_id", "=", account_id),
        ])
      )
      .execute();

    return res.status(200).json({
      success: true,
      messages,
    });
  }
);

export const isUsernameAvailable = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    const account = await db
      .selectFrom("account")
      .select("id")
      .where("username", "=", username)
      .executeTakeFirst();

    if(account) {
      throw new appError("Username already taken", 400);
    }

    return res.status(200).json({
      success: true,
    });
  }
);

export const isEmailAvailable = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const account = await db
      .selectFrom("account")
      .select("id")
      .where("email", "=", email)
      .executeTakeFirst();

    if(account) {
      throw new appError("Email already taken", 400);
    }

    return res.status(200).json({
      success: true,
    });
  }
);
