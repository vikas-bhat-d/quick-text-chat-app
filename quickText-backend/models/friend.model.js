import mongoose, { Schema } from "mongoose";

const friendsSchema = new Schema(
  {
    userOne: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userTwo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    expiration: {
      type: Schema.Types.Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Friend = mongoose.model("Friend", friendsSchema);
