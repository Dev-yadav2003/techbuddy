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
    },
  },
  { timestamps: true }
);
const chatMessages = new mongoose.Schema({
  participents: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  ],
  messages: [messagesSchema],
});

module.exports = mongoose.model("Chat", chatMessages);
