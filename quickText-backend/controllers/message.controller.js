import { Message } from "../models/message.model.js";
import apiError from "../utils/apiError.utils.js";
import apiResponse from "../utils/apiResponse.utils.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import cloudinaryUpload from "../utils/cloudinary.utils.js";
import { getIO } from "../src/socket.js";

import fs from "fs";

export const sendMessage = asyncHandler(async (req, res, next) => {
  const io = getIO();

  const user = req.user;
  const { message, isImage, reciever } = req.body;
  const imagePath = req?.file ? req.file.path : "";

  let cloudinaryResponse;

  if (isImage) {
    if (req.file && imagePath.trim() != "") {
      cloudinaryResponse = await cloudinaryUpload(imagePath);
      console.log(cloudinaryResponse);
    }
  }

  const newMessage = new Message({
    sender: user?._id,
    reciever: reciever,
    message: message,
    image: cloudinaryResponse?.secure_url || null,
  });

  const savedMessage = await newMessage.save();

  if (!savedMessage) throw new apiError(500, "couldn't send the message");

  if (req.file) fs.unlinkSync(req?.file?.path);

  res.status(200).send(new apiResponse(200, savedMessage));
});

export const getMessagesFromId = asyncHandler(async (req, res, next) => {
  const { uid } = req.query;

  const user = req.user;

  const messages = await Message.find({
    $or: [
      { sender: user?._id, reciever: uid },
      { sender: uid, reciever: user?._id },
    ],
  }).sort({ createdAt: 1 });
  // .limit(limit || Number.MAX_SAFE_INTEGER);

  res.status(200).send(new apiResponse(200, messages));
});
