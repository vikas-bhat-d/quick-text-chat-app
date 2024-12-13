import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const userRouter=Router();

userRouter.route("/register").post(upload.single("displayPicture"),registerUser);
userRouter.route("/get").get(asyncHandler(
        async (req,res,next) => {
            res.send("test complete");
        }
))

export {userRouter}