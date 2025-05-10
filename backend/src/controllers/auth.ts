import { Request, Response, NextFunction } from "express";
import { hash, genSalt, compare } from "bcrypt";
import db from "../db/db.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import appError from "../utils/appError.js";
import { sendVerificationMail } from "../utils/mailer.js";
import { randomBytes } from "crypto";

export const register = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password, email, fullName } = req.body;
    const regex = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
    const match = email.match(regex);
    if (!match) {
      throw new appError("Invalid Email Address", 400);
    }

    const account = await db
      .insertInto("account")
      .values({
        username,
        password: await hash(password, await genSalt(10)),
        email,
      })
      .returning(["id"])
      .executeTakeFirstOrThrow();
    await db
      .insertInto("profile")
      .values({
        account_id: account.id,
        name: fullName,
      })
      .execute();

    await sendVerificationMail({ id: account.id, username, email });
    await createSession(account.id, res);
    return res.status(201).json({
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
      .where((eb) =>
        eb.or([eb("username", "=", identifier), eb("email", "=", identifier)])
      )
      .executeTakeFirst();
    if (!account || !(await compare(password, account.password))) {
      throw new appError("Invalid credentials", 401);
    }

    await createSession(account.id, res);
    return res.status(200).json({
      success: true,
    });
  }
);

export const logout = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sid } = req.cookies;
    await db.deleteFrom("session").where("id", "=", sid).execute();
    res.clearCookie("sid");
    return res.status(200).json({
      success: true,
    });
  }
);

export const triggerVerificationMail = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    await sendVerificationMail(req.account!);
    return res.status(200).json({
      success: true,
    });
  }
);

export const deactivateAccount = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    await db.deleteFrom("account").where("id", "=", req.account!.id).execute();
    return res.status(204).json({
      success: true,
    });
  }
);

export const createSession = async (account_id: string, res: Response) => {
  const id = randomBytes(32).toString("hex");
  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + 7);
  await db
    .insertInto("session")
    .values({
      id,
      account_id,
      expires_at,
    })
    .returning(["id"])
    .execute();
  res.cookie("sid", id);
};
