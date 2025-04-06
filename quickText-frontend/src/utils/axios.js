import axios from "axios";

export const axiosInstance = new axios.create({
  baseURL: "https://quick-text-chat-app.onrender.com/api/v1",
  withCredentials: true,
});
