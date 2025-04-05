import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  editProfile,
  searchUserByUsername,
  getUserById,
} from "../controllers/user.controller.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(upload.single("displayPicture"), registerUser);

userRouter.route("/").get(
  verifyJWT,
  asyncHandler(async (req, res, next) => {
    res.send(req.user);
  })
);

userRouter.route("/id").get(verifyJWT, getUserById);

userRouter.route("/login").post(loginUser);
userRouter.route("/logout").delete(verifyJWT, logoutUser);
userRouter.route("/editProfile").patch(verifyJWT, editProfile);

userRouter.route("/search").get(verifyJWT, searchUserByUsername);

userRouter
  .route("/update")
  .patch(verifyJWT, upload.single("displayPicture"), editProfile);

export { userRouter };
