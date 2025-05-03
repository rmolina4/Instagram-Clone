import { Request, Response, NextFunction } from "express";
import appError from "./appError.js";

export default function errorHandler(
  err: appError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  const constraintMessages: { [key: string]: string } = {
    account_username_key: "Username is already taken.",
    account_email_key: "Email is already taken.",
  };

  if (err.constraint) {
    err.statusCode = 401;
    err.message =
      constraintMessages[err.constraint] || "Duplicate key is not allowed.";
  }
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
}
