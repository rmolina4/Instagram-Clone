import express from "express";
import cors from "cors";
import { CronJob } from "cron";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import { removeUnverified } from "./controllers/auth.js";
import authRouter from "./routes/auth.js";
import accountRouter from "./routes/account.js";
import postRouter from "./routes/post.js";
import errorHandler from "./utils/errorHandler.js";

const app = express();

// middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/user", accountRouter);
app.use("/post", postRouter);
app.use(errorHandler);

// jobs
const job = new CronJob("30 1 1,15 * *", async () => {
  await removeUnverified();
  console.log("Unverified accounts have been removed.");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  job.start();
});