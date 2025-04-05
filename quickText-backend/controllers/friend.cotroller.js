import asyncHandler from "../utils/asyncHandler.utils.js";
import apiResponse from "../utils/apiResponse.utils.js";
import apiError from "../utils/apiError.utils.js";
import { Friend } from "../models/friend.model.js";

export const sendRequest = asyncHandler(async (req, res, next) => {
  console.log("testing");

  const { userTwo } = req.body;
  const userOne = req.user?._id;

  if (!userTwo || !userOne)
    throw new apiError(400, "invalid request recieved undefined data");

  const existingRequest = await Friend.findOne({
    $or: [
      { $and: [{ userOne }, { userTwo }] },
      { $and: [{ userOne: userTwo }, { userTwo: userOne }] },
    ],
  });

  console.log(existingRequest);
  if (existingRequest && existingRequest?.status == "accepted")
    throw new apiError(400, "Already a friend");

  if (
    Date.now() < existingRequest?.expiration &&
    existingRequest?.status == "pending"
  )
    throw new apiError(400, "Duplicate request");

  const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  console.log(
    expiration.getHours(),
    expiration.getMinutes(),
    expiration.getDate()
  );
  const friend = new Friend({
    userOne,
    userTwo,
    expiration,
    status: "pending",
  });

  let savedFriend;
  try {
    savedFriend = await friend.save();
    console.log(savedFriend);
  } catch (error) {
    console.log(error);
    throw new apiError(500, "couldn't send friend request");
  }

  res
    .status(200)
    .send(new apiResponse(200, savedFriend, "friendrequest sent successfully"));
});

export const fetchRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId)
    throw new apiError(400, "Invalid request, user not authenticated");

  const friendRequests = await Friend.find({
    status: "pending",
    expiration: { $gt: Date.now() },
    $or: [{ userOne: userId }, { userTwo: userId }],
  });

  const sentRequests = friendRequests.filter(
    (req) => req.userOne.toString() === userId.toString()
  );
  const receivedRequests = friendRequests.filter(
    (req) => req.userTwo.toString() === userId.toString()
  );

  res
    .status(200)
    .send(
      new apiResponse(
        200,
        { sentRequests, receivedRequests },
        "Friend requests fetched successfully"
      )
    );
});

export const fetchFriends = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId)
    throw new apiError(400, "Invalid request, user not authenticated");

  const friends = await Friend.aggregate([
    {
      $match: {
        status: "accepted",
        $or: [{ userOne: userId }, { userTwo: userId }],
      },
    },
    {
      $lookup: {
        from: "users",
        let: {
          friendId: {
            $cond: {
              if: { $eq: ["$userOne", userId] },
              then: "$userTwo",
              else: "$userOne",
            },
          },
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$friendId"] } } },
          { $project: { password: 0, refreshToken: 0 } },
        ],
        as: "friendDetails",
      },
    },
    { $unwind: "$friendDetails" },
    { $replaceRoot: { newRoot: "$friendDetails" } },
  ]);

  res
    .status(200)
    .send(new apiResponse(200, friends, "Friends list fetched successfully"));
});

export const acceptRequest = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { requesterId } = req.body;
  if (!userId || !requesterId)
    throw new apiError(400, "Invalid request, missing data");

  const friendRequest = await Friend.findOne({
    userOne: requesterId,
    userTwo: userId,
    status: "pending",
    expiration: { $gt: Date.now() },
  });

  if (!friendRequest)
    throw new apiError(404, "No pending friend request found");

  friendRequest.status = "accepted";
  await friendRequest.save();

  res
    .status(200)
    .send(
      new apiResponse(
        200,
        friendRequest,
        "Friend request accepted successfully"
      )
    );
});
