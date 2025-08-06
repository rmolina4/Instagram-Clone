import { Request, Response } from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import appError from "../utils/appError.js";
import * as accountRepository from "../repositories/account.js";
import * as mediaHandler from "../utils/mediaHandler.js";

export const getProfile = asyncWrapper(async (req: Request, res: Response) => {
  const { username } = req.params;
  const profile = await accountRepository.getProfile(req.account!.id, username);
  return res.status(200).json({
    success: true,
    profile,
  });
});

export const editProfile = asyncWrapper(async (req: Request, res: Response) => {
  const { username } = req.params;
  const { name, bio } = req.body;
  if (req.account!.username != username) {
    throw new appError("Access denied", 403);
  }
  await accountRepository.editProfile(username, name, bio);
  return res.status(200).json({
    success: true,
  });
});

export const getNextAccountPosts = asyncWrapper(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const cursor = req.query.cursor as string;
    const posts = await accountRepository.getNextAccountPosts(
      req.account!.id,
      username,
      cursor
    );
    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const getNextLikedPosts = asyncWrapper(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const cursor = req.query.cursor as string;
    const posts = await accountRepository.getNextLikedPosts(
      req.account!.id,
      username,
      cursor
    );
    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const getNextBookmarkedPosts = asyncWrapper(
  async (req: Request, res: Response) => {
    const { username } = req.params;
    const cursor = req.query.cursor as string;
    const posts = await accountRepository.getNextBookmarkedPosts(
      req.account!.id,
      username,
      cursor
    );
    return res.status(200).json({
      success: true,
      posts,
    });
  }
);

export const followAccount = asyncWrapper(
  async (req: Request, res: Response) => {
    const { account_id } = req.params;
    let status = 201;

    try {
      await accountRepository.createFollow(req.account!.id, account_id);
    } catch (err: unknown) {
      if ((err as appError).code === "23503") {
        throw new appError("Account not found", 404);
      }
      status = 200;
      await accountRepository.deleteFollow(req.account!.id, account_id);
    }

    return res.status(status).json({
      success: true,
    });
  }
);

export const createMessage = asyncWrapper(
  async (req: Request, res: Response) => {
    const { account_id } = req.params;
    const { body } = req.body;
    await accountRepository.createMessage(req.account!.id, account_id, body);
    return res.status(200).json({
      success: true,
    });
  }
);

export const deleteMessage = asyncWrapper(
  async (req: Request, res: Response) => {
    const { message_id } = req.params;
    const message = await accountRepository.getMessage(message_id);
    if (message.account_id != req.account!.id) {
      throw new appError("Access denied", 403);
    }
    await accountRepository.deleteMessage(message_id);
    return res.status(200).json({
      success: true,
    });
  }
);

export const editMessage = asyncWrapper(async (req: Request, res: Response) => {
  const { message_id } = req.params;
  const { body } = req.body;

  const message = await accountRepository.getMessage(message_id);
  if (message.account_id != req.account!.id) {
    throw new appError("Access denied", 403);
  }
  await accountRepository.editMessage(message_id, body);
  return res.status(200).json({
    success: true,
  });
});

export const getMessages = asyncWrapper(async (req: Request, res: Response) => {
  const { account_id } = req.params;
  const messages = await accountRepository.getMessages(
    req.account!.id,
    account_id
  );
  return res.status(200).json({
    success: true,
    messages,
  });
});

export const isUsernameAvailable = asyncWrapper(
  async (req: Request, res: Response) => {
    const { username } = req.body;
    const account = await accountRepository.getAccountByUsername(username);
    if (account) {
      throw new appError("Username already taken", 400);
    }
    return res.status(200).json({
      success: true,
    });
  }
);

export const isEmailAvailable = asyncWrapper(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const account = await accountRepository.getAccountByEmail(email);
    if (account) {
      throw new appError("Email already taken", 400);
    }
    return res.status(200).json({
      success: true,
    });
  }
);

export const uploadAvatar = asyncWrapper(
  async (req: Request, res: Response) => {
    const { account_id } = req.params;
    const file = req.file as Express.Multer.File;
    const avatar_url = await mediaHandler.createAvatar(file, account_id);
    await accountRepository.editProfile(
      account_id,
      undefined,
      undefined,
      avatar_url
    );
    return res.status(200).json({
      success: true,
    });
  }
);

export const getUsernames = asyncWrapper(
  async (req: Request, res: Response) => {
    const prefix = req.query.prefix as string;
    const users = await accountRepository.getUsernames(prefix);
    return res.status(200).json({
      success: true,
      users,
    });
  }
);
