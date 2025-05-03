import { createTransport } from "nodemailer";
import jwt from "jsonwebtoken";
const { sign } = jwt;

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationMail = async (account: {
  id: string;
  username: string;
  email: string;
}) => {
  const token = sign(account, process.env.JWT_SECRET!);
  const port = process.env.PORT || 8080;
  const url = process.env.BASE_URL! + port + "/verify/" + token;
  const html = `
    <h1>Hello ${account.username}!</h1>
    <p>Please verify your email to complete your account setup.</p>
    <p><a href="${url}">Verify Email Address</a></p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  const message = {
    from: process.env.EMAIL_USER,
    to: account.email,
    subject: "Authenticate Your Email Address",
    html,
  };
  await transporter.sendMail(message);
};
