require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.get("/health", (_, res) => res.json({ status: "ok", service: "Use(Less) Chat" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const SECRET = process.env.SECRET_KEY || "dev_secret_key_change_in_production_min_32_chars!!";

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const payload = jwt.verify(token, SECRET);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);

  socket.on("join_chat", (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  socket.on("send_message", (data) => {
    const { chatId, message } = data;
    if (!chatId || !message?.content) return;

    const payload = {
      id: message.id,
      chat_id: chatId,
      sender_id: socket.userId,
      content: message.content,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: message.sender,
    };
    io.to(`chat:${chatId}`).emit("new_message", payload);
  });

  socket.on("typing", (chatId) => {
    socket.to(`chat:${chatId}`).emit("user_typing", { userId: socket.userId, chatId });
  });

  socket.on("stop_typing", (chatId) => {
    socket.to(`chat:${chatId}`).emit("user_stop_typing", { userId: socket.userId, chatId });
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Chat server running on port ${PORT}`));
