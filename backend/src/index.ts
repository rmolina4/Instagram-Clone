import express, { Express } from "express";
import cors from "cors";
import { CronJob } from "cron";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { removeUnverified } from "./controllers/auth";
import authRouter from "./routes/auth";
import accountRouter from "./routes/account";
import errorHandler from "./errorHandler";
dotenv.config();

const app: Express = express();

// middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(authRouter);
app.use("/user", accountRouter);
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
