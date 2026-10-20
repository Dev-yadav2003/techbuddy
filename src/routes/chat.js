const express = require("express");
const mongoose = require("mongoose");
const checkAuth = require("../middlewares/checkAuth");
const Chat = require("../models/chatMessages");
const User = require("../models/user");
const { areConnected } = require("../utils/connections");

const chatRoute = express.Router();

chatRoute.get("/chat/:targetUserId", checkAuth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (!(await areConnected(userId, targetUserId))) {
      return res
        .status(403)
        .json({ error: "You can only chat with your connections" });
    }

    const targetUser = await User.findById(targetUserId).select(
      "firstName lastName profile"
    );
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    });

    // Only send the latest 100 messages to keep the payload small.
    const messages = (chat?.messages || []).slice(-100).map((msg) => ({
      _id: msg._id,
      senderId: msg.sender,
      text: msg.text,
      timestamp: msg.createdAt,
    }));

    res.json({ targetUser, messages });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = chatRoute;
