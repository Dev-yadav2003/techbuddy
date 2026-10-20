const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxLength: 2000,
    },
  },
  { timestamps: true }
);
const chatMessages = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    ],
    messages: [messagesSchema],
  },
  { timestamps: true }
);

chatMessages.index({ participants: 1 });

module.exports = mongoose.model("Chat", chatMessages);
