import { Request, Response } from "express";
import { hash, genSalt, compare } from "bcrypt";
import asyncWrapper from "../utils/asyncWrapper.js";
import appError from "../utils/appError.js";
import * as mailer from "../utils/mailer.js";
import { randomBytes } from "crypto";
import * as authRepository from "../repositories/auth.js";

export const register = asyncWrapper(
  async (req: Request, res: Response) => {
    const { username, password, email, fullName } = req.body;
    const regex = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
    const match = email.match(regex);
    if (!match) {
      throw new appError("Invalid Email Address", 400);
    }

    const account = await authRepository.createAccount(
      username,
      await hash(password, await genSalt(10)),
      email
    );
    await authRepository.createProfile(account.id, fullName);

    await mailer.sendVerificationMail({ id: account.id, username, email });
    await createSession(account.id, res);
    return res.status(201).json({
      success: true,
    });
  }
);

export const login = asyncWrapper(
  async (req: Request, res: Response) => {
    const { identifier, password } = req.body;

    const account = await authRepository.getAccountByUsernameOrEmail(
      identifier
    );
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
  async (req: Request, res: Response) => {
    const { sid } = req.cookies;
    await authRepository.deleteSession(sid);
    res.clearCookie("sid");
    return res.status(200).json({
      success: true,
    });
  }
);

export const sendVerificationMail = asyncWrapper(
  async (req: Request, res: Response) => {
    await mailer.sendVerificationMail(req.account!);
    return res.status(200).json({
      success: true,
    });
  }
);

export const deleteAccount = asyncWrapper(
  async (req: Request, res: Response) => {
    await authRepository.deleteAccount(req.account!.id);
    return res.status(200).json({
      success: true,
    });
  }
);

export const createSession = async (account_id: string, res: Response) => {
  const id = randomBytes(32).toString("hex");
  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + 7);
  await authRepository.createSession(id, account_id, expires_at);
  res.cookie("sid", id, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const me = asyncWrapper(
  async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      account: req.account,
    });
  }
);
