import asyncHandler from "../utils/asyncHandler.utils.js";
import apiError from "../utils/apiError.utils.js";
import apiResponse from "../utils/apiResponse.utils.js";
import { User } from "../models/user.model.js";
import cloudinaryUpload, {
  cloudinaryRemove,
} from "../utils/cloudinary.utils.js";
import fs from "fs";
import mongoose from "mongoose";
import { response } from "express";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

const generateTokens = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(400, error?.message || "tokens couldn't be generated");
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  const displayPicture = req?.file ? req.file.path : "";
  let cloudinaryResponse = null;
  let savedUser = null;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .send(new apiResponse(400, null, "all fields are required"));
  }

  let existedUser = await User.findOne({ $or: [{ username }, { email }] });
  console.log("existedUser", existedUser);
  if (existedUser) {
    fs.unlinkSync(displayPicture);
    throw new apiError(400, "user alreary exists");
  }

  try {
    if (req.file && displayPicture.trim() != "") {
      cloudinaryResponse = await cloudinaryUpload(displayPicture);
      console.log(cloudinaryResponse);
    }
  } catch (error) {
    throw new apiError(400, "Cloudinary Upload Error: ", error);
  }

  const newUser = new User({
    username,
    password,
    email,
    profilePicture: cloudinaryResponse?.secure_url,
    profilePictureId: cloudinaryResponse?.public_id,
  });

  try {
    savedUser = await newUser.save();
    console.log(savedUser);
  } catch (error) {
    console.log(error);
    throw new apiError(500, "couldn't register user");
  }

  if (req.file) fs.unlinkSync(req?.file?.path);

  const registeredUser = await User.findOne({ _id: savedUser._id }).select(
    "-password -createdAt -updatedAt"
  );
  console.log(registeredUser);

  res.status(200).send(new apiResponse(200, registeredUser));
});

const fetchuser = asyncHandler(async (req, res, next) => {
  const user = req.query.username;
  let fetchedUser = await User.findOne({ username: user });
  res.send(new apiResponse(200, fetchedUser, "fetched user succesfully"));
});

const fetchuserID = asyncHandler(async (req, res, next) => {
  console.log(req.query.userId);
  const userID = new mongoose.Types.ObjectId(req.query.userId);
  let fetchedUser = await User.findOne({ _id: userID });
  res.send(new apiResponse(200, fetchedUser, "fetched user succesfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  let { username, password } = req.body;
  console.log(req.body);
  if (
    !username ||
    !password ||
    username?.trim() == "" ||
    password?.trim() == ""
  )
    throw new apiError(400, "All fields are required");

  let existedUser = await User.findOne({ username: username });
  if (!existedUser) throw new apiError(400, "Incorrect username");

  let isPasswordCorrect = await existedUser.checkPassword(password);

  if (!isPasswordCorrect) throw new apiError(400, "Incorrect password");

  let { accessToken, refreshToken } = await generateTokens(existedUser._id);

  let loggedInUser = await User.find({ _id: existedUser._id }).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    })
    .json(
      new apiResponse(
        200,
        { User: loggedInUser, accessToken, refreshToken },
        "logged user succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        refreshToken: undefined,
      },
    }
  );

  return res
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .status(200)
    .json(new apiResponse(200, {}, "User logged out succesfully"));
});

const editProfile = asyncHandler(async (req, res, next) => {
  // console.log("req recieved");
  const newProfile = req?.file ? req.file.path : "";
  const user = req.user;

  if(user.profilePictureId)
    const response = await cloudinaryRemove(user.profilePictureId);
  let cloudinaryResponse = null;

  if (req.file && newProfile.trim() != "") {
    cloudinaryResponse = await cloudinaryUpload(newProfile);
    console.log(cloudinaryResponse);
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        profilePicture: cloudinaryResponse?.secure_url,
        profilePictureId: cloudinaryResponse?.public_id,
      },
    },
    { new: true }
  );
  console.log("test: ", updatedUser);
  res.send(new apiResponse(200, updatedUser));
});

const searchUserByUsername = asyncHandler(async (req, res, next) => {
  const { q: username } = req.query;

  if (!username) throw new apiError(400, "should provide username to search");

  const users = await User.find({
    username: { $regex: username, $options: "i" },
  }).select("-password");

  const filteredUsers = users.filter(
    (item) => item._id.toString() != req.user?._id.toString()
  );

  res
    .status(200)
    .send(new apiResponse(200, filteredUsers, "username fetched successfully"));
});

const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.query;

  const user = await User.findById(id).select("-password");

  return res
    .status(200)
    .send(new apiResponse(200, user, "user fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  fetchuser,
  fetchuserID,
  editProfile,
  searchUserByUsername,
  getUserById,
};
