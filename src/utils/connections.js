const Connection = require("../models/connection");

const areConnected = async (userId, otherUserId) => {
  const connection = await Connection.exists({
    status: "accepted",
    $or: [
      { fromUserId: userId, toUserId: otherUserId },
      { fromUserId: otherUserId, toUserId: userId },
    ],
  });
  return Boolean(connection);
};

module.exports = { areConnected };
