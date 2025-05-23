import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";
import authRouter from "./routes/auth.js";
import accountRouter from "./routes/account.js";
import postRouter from "./routes/post.js";
import errorHandler from "./utils/errorHandler.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/user", accountRouter);
app.use("/post", postRouter);
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});