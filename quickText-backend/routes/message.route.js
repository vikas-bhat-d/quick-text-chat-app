import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getMessagesFromId,
  sendMessage,
} from "../controllers/message.controller.js";

export const messageRouter = Router();

messageRouter.route("/").post(verifyJWT, upload.single("image"), sendMessage);
messageRouter.route("/").get(verifyJWT, getMessagesFromId);
