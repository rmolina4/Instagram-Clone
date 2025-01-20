import { createTransport } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationMail = async (username: string, email: string) => {
  const html = `
    <h1>Hello ${username}!</h1>
    <p>Please verify your email to complete your account setup.</p>
    <p><a href="">Verify Email Address</a></p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  const message = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Authenticate Your Email Address",
    html,
  };
  await transporter.sendMail(message);
};
