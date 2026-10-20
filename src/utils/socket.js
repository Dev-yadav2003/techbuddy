const socketIO = require("socket.io");
const { parseCookie } = require("cookie");
const { corsOrigins } = require("../config/env");
const { getUserFromToken } = require("./auth");
const { areConnected } = require("./connections");
const Chat = require("../models/chatMessages");

const getRoomId = (userId, targetUserId) =>
  [userId.toString(), targetUserId.toString()].sort().join("_");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  // Authenticate every socket with the same JWT cookie the REST API uses,
  // so the sender is always the logged-in user, not whatever the client claims.
  io.use(async (socket, next) => {
    try {
      const { token } = parseCookie(socket.handshake.headers.cookie || "");
      if (!token) return next(new Error("Unauthorized"));
      const user = await getUserFromToken(token);
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;

    socket.on("joinChat", async ({ targetUserId }) => {
      try {
        if (!(await areConnected(user._id, targetUserId))) {
          return socket.emit("chatError", {
            error: "You can only chat with your connections",
          });
        }
        socket.join(getRoomId(user._id, targetUserId));
      } catch (err) {
        socket.emit("chatError", { error: err.message });
      }
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      try {
        const trimmed = String(text || "").trim();
        if (!trimmed) return;

        if (!(await areConnected(user._id, targetUserId))) {
          return socket.emit("chatError", {
            error: "You can only chat with your connections",
          });
        }

        let chat = await Chat.findOne({
          participants: { $all: [user._id, targetUserId] },
        });
        if (!chat) {
          chat = new Chat({ participants: [user._id, targetUserId] });
        }
        chat.messages.push({ sender: user._id, text: trimmed });
        await chat.save();

        const saved = chat.messages[chat.messages.length - 1];
        io.to(getRoomId(user._id, targetUserId)).emit("messageReceived", {
          _id: saved._id,
          senderId: user._id,
          firstName: user.firstName,
          text: saved.text,
          timestamp: saved.createdAt,
        });
      } catch (err) {
        socket.emit("chatError", { error: err.message });
      }
    });
  });
};

module.exports = initializeSocket;
