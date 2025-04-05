import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  acceptRequest,
  fetchFriends,
  fetchRequests,
  sendRequest,
} from "../controllers/friend.cotroller.js";

const friendRouter = Router();

friendRouter.route("/").post(verifyJWT, sendRequest);
friendRouter.route("/").get(verifyJWT, fetchRequests);
friendRouter.route("/friends").get(verifyJWT, fetchFriends);
friendRouter.route("/accept").post(verifyJWT, acceptRequest);
export { friendRouter };
