import express, { Router } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { User } from "../models/user.model.js";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(
  cors({
    origin: JSON.parse(process.env.CORS_ORIGIN),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("listening");
});

import { userRouter } from "../routes/user.route.js";
import { friendRouter } from "../routes/friend.route.js";
import { socketAuth } from "../middlewares/auth.middleware.js";
import { messageRouter } from "../routes/message.route.js";
import { initSocket } from "./socket.js";
app.use("/api/v1/user", userRouter);
app.use("/api/v1/friend", friendRouter);
app.use("/api/v1/message", messageRouter);

app.get("/hello", (req, res) => {
  const user = req.query.user;
  res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        </head>
        <body>
        <p>Hello ${user} this is the test file</p>
        </body>
        </html>`);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  console.log("error detected", err.message);
  return res.status(err.statusCode).send({ ...err, message: err.message });
});

export default server;
