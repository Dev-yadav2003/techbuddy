const express = require("express");
const mongoose = require("mongoose");
const Connection = require("../models/connection");
const User = require("../models/user");
const checkAuth = require("../middlewares/checkAuth");

const request = express.Router();
request.post("/request/send/:status/:toUserId", checkAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const fromUserId = req.user._id;

    const allowedStatus = ["ignored", "intrested"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status: " + status });
    }

    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (fromUserId.equals(toUserId)) {
      return res.status(400).json({ error: "Cannot send request to yourself" });
    }

    const alreadyRequestExist = await Connection.findOne({
      $or: [
        { toUserId, fromUserId },
        {
          toUserId: fromUserId,
          fromUserId: toUserId,
        },
      ],
    });

    if (alreadyRequestExist) {
      return res.status(409).json({ error: "Request already exists" });
    }

    const isUser = await User.exists({ _id: toUserId });
    if (!isUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const connection = new Connection({ status, toUserId, fromUserId });
    const data = await connection.save();

    res.json({ message: "Request sent successfully!", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

request.post(
  "/request/review/:status/:requestId",
  checkAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loginUser = req.user;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: "Invalid status: " + status });
      }

      if (!mongoose.isValidObjectId(requestId)) {
        return res.status(400).json({ error: "Invalid request id" });
      }

      const checkRequest = await Connection.findOne({
        _id: requestId,
        toUserId: loginUser._id,
        status: "intrested",
      });

      if (!checkRequest) {
        return res.status(404).json({ error: "No request found" });
      }

      checkRequest.status = status;

      const data = await checkRequest.save();

      return res
        .status(200)
        .json({ message: "Connection request " + status, data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = request;
