import { Request, Response, NextFunction } from "express";
import asyncWrapper from "./asyncWrapper.js";
import appError from "./appError.js";
import db from "../db/db.js";

const validateSession = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sid } = req.cookies;
    if (!sid) {
      throw new appError("Must be logged in to access.", 401);
    }

    const session = await db
      .selectFrom("session")
      .innerJoin("account", "account.id", "session.account_id")
      .select([
        "account.id",
        "account.username",
        "account.email",
        "session.expires_at",
      ])
      .where("session.id", "=", sid)
      .executeTakeFirst();

    const currentDate = new Date();
    if (!session || currentDate >= session.expires_at) {
      if (session) {
        await db.deleteFrom("session").where("id", "=", sid).execute();
      }
      res.clearCookie("sid");
      throw new appError("Session Expired.", 401);
    }

    req.account = {
      id: session.id,
      username: session.username,
      email: session.email,
    };
    next();
  }
);

export default validateSession;
