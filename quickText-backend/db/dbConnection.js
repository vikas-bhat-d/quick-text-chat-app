import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      "connected to MongoDB at: ",
      connectionInstance.connection.host,
      ":",
      connectionInstance.connection.port
    );
  } catch (err) {
    console.log("MongoDB connection errors: ", err);
  }
};

export default connectDB;
