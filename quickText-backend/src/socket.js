import { Server } from "socket.io";
import { socketAuth } from "../middlewares/auth.middleware.js";
import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 0,
  checkperiod: 600,
});

let io;

const saveSocket = (socketId, userId) => {
  cache.set(userId, socketId);

  const existingSockets = cache.get(userId) || [];
  if (!existingSockets.includes(socketId)) {
    existingSockets.push(socketId);
    cache.set(userId, existingSockets);
  }
};

const removeSocket = (socketId) => {
  const userId = cache.get(socketId);
  cache.del(socketId);

  if (userId) {
    const socketList = cache.get(userId) || [];
    const updatedList = socketList.filter((id) => id != socketId);

    if (updatedList.length == 0) cache.del(userId);
    else cache.set(userId, updatedList);
  }
};

const getSocketForUser = (userId) => {
  return cache.get(userId) || [];
};

const getUserFromSocket = (socketId) => {
  return cache.get(socketId);
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: JSON.parse(process.env.CORS_ORIGIN),
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("new connection: ", socket.id);
    const socketId = socket.id.toString();
    const userId = socket.handshake.user._id.toString();

    saveSocket(socketId, userId);

    socket.join("global");
    io.to("global").emit("join-message", "new user joined");

    socket.on("new-message", (msg) => {
      console.log("new message recieved", msg);
      const recieverId = getSocketForUser(msg.reciever.toString());
      if (recieverId.length>0) io.to(recieverId).emit("message", msg);
    });

    socket.on("disconnect", (reason) => {
      console.log(socket.id, " disconnectd : ", reason);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket io is not initialized");

  return io;
};
