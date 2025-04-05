import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import apiResponse from "../utils/apiResponse.utils.js";
import apiError from "../utils/apiError.utils.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!accessToken) throw new apiError(400, "Unauthorized request");

  let decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken) throw new apiError(400, "Invalid Token");

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  if (!user) throw new apiError(400, "Invalid token,User not found");

  req.user = user;
});

const socketAuth = async (socket, next) => {
  const accessToken = socket.handshake.auth.accessToken;
  if (!accessToken) return next(new apiError(400, "Unauthorized request"));

  let decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken) next(new apiError(400, "Invalid Token"));
  // if (!decodedToken) return;

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );
  if (!user) next(new apiError(400, "Invalid token,User not found"));

  socket.handshake.user = user;
  next();
};

export { verifyJWT, socketAuth };
