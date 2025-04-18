const socketIO = require("socket.io");

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);
      console.log(`${userId} have joined room with roomId ` + roomId);
    });
    socket.on(
      "sendMessage",
      ({ userId, targetUserId, text, firstName, timestamp }) => {
        const roomId = [userId, targetUserId].sort().join("_");
        console.log(firstName + ":" + text + " " + timestamp);
        io.to(roomId).emit("messageRecieved", { firstName, text, timestamp });
      }
    );
  });
};

module.exports = initializeSocket;
