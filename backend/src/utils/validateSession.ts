import { Request, Response, NextFunction } from "express";
import asyncWrapper from "./asyncWrapper.js";
import appError from "./appError.js";
import * as authRepository from "../repositories/auth.js";

const validateSession = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sid } = req.cookies;
    if (!sid) {
      throw new appError("Must be logged in to access.", 401);
    }
    const session = await authRepository.getAccountBySession(sid);

    const currentDate = new Date();
    if (!session || currentDate >= session.expires_at) {
      if (session) {
        await authRepository.deleteSession(sid);
      }
      for (const cookie in req.cookies) {
        res.clearCookie(cookie);
      }
      return res.status(401).json({
        success: false,
        message: "Session Expired.",
      });
    }

    req.account = {
      id: session.id,
      username: session.username,
      email: session.email,
      name: session.name,
    };
    next();
  },
);

export default validateSession;
