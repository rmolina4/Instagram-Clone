import { Response } from "express";
import { sign } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function sendCookie(account: Object, res: Response) {
  const token = sign(account, process.env.JWT_SECRET!);
  res.cookie("token", token);
}
