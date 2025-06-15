import { Server } from "socket.io";
import http from "http";
import app from "../app.js";

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://twitter-lite-frontend.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Mapping userId => Set of socketIds
const userSocketMap = {};

export const getRecieverSocketId = (receiverId) => {
  const socketSet = userSocketMap[receiverId];
  if (socketSet && socketSet.size > 0) {
    return Array.from(socketSet)[0]; // Return one socket for the receiver
  }
  return null;
};

const getOnlineUsers = () => Object.keys(userSocketMap);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    socket.userId = userId;

    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  io.emit("online-users", getOnlineUsers());

  socket.on("disconnect", () => {
    const userId = socket.userId;

    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);

      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }

      io.emit("online-users", getOnlineUsers());
    }

    console.log("❌ User disconnected:", socket.id);
  });
});

export { app, io, server };
