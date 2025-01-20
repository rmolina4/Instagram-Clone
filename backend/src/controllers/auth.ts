import { Request, Response, NextFunction } from "express";
import { hash, genSalt, compare } from "bcrypt";
import { verify } from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../db/db";
import asyncWrapper from "../asyncWrapper";
import appError from "../appError";
import sendCookie from "../sendCookie";
import { sendVerificationMail } from "../mailer";
dotenv.config();

export const register = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email } = req.body;

    const regex = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
    const match = email.match(regex);
    if (!match) {
      throw new appError("Invalid Email Address", 401);
    }

    const account = await db
      .insertInto("account")
      .values({
        username,
        password: await hash(password, await genSalt(10)),
        email,
      })
      .returning(["id"])
      .executeTakeFirst();

    await sendVerificationMail(username, email);
    sendCookie({ id: account!.id, username, email }, res);
    return res.json({
      success: true,
    });
  }
);

export const login = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { identifier, password } = req.body;

    const account = await db
      .selectFrom("account")
      .select(["id", "username", "email", "password"])
      .where((db) =>
        db.or({
          username: identifier,
          email: identifier,
        })
      )
      .executeTakeFirst();
    if (!account) {
      throw new appError("Invalid credentials", 401);
    }

    const match = await compare(password, account.password);
    if (!match) {
      throw new appError("Invalid credentials", 401);
    }

    sendCookie(
      { id: account.id, username: account.username, email: account.email },
      res
    );
    return res.json({
      success: true,
    });
  }
);

export const authenticateToken = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.cookies;
    if (!token) {
      throw new appError("Must be logged in to access.", 401);
    }
    const decoded = verify(token, process.env.JWT_SECRET!);
    req.account = decoded as { id: string; username: string; email: string };
    next();
  }
);

export const verifyEmail = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    await sendVerificationMail(req.account!.username, req.account!.email);
    return res.json({
      success: true,
    });
  }
);

export const deactivateAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    await db
      .updateTable("account")
      .set({
        deleted_at: date,
      })
      .where("id", "=", req.account!.id);
  }
);

export const removeUnverified = async () => {
  const date = new Date();
  const weekAgo = new Date(date);
  weekAgo.setDate(weekAgo.getDate() - 7);

  await db
    .updateTable("account")
    .set({
      deleted_at: date,
    })
    .where("created_at", "<", weekAgo)
    .where("verified_at", "=", null)
    .execute();
};
