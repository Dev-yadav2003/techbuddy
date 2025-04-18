const express = require("express");
const Connection = require("../models/connection");
const User = require("../models/user");
const checkAuth = require("../middlewares/checkAuth");

const request = express.Router();
request.post("/request/send/:status/:toUserId", checkAuth, async (req, res) => {
  try {
    const status = req.params.status;
    const toUserId = req.params.toUserId;
    const fromUserId = req.user._id;

    const allowedStatus = ["ignored", "intrested"];
    if (!allowedStatus.includes(status)) {
      return res.json({ message: "invalid status request" + status });
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
      return res.status(400).json({ message: "request already exist" });
    }

    const isUser = await User.findById(toUserId);
    if (!isUser) {
      return res.json({ message: "user is not present" });
    }

    const connection = new Connection({ status, toUserId, fromUserId });

    await connection.save();

    res.send("Request sent successfully!");
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
        return res.status(400).json({ message: "Invalid status " + status });
      }

      const checkRequest = await Connection.findOne({
        _id: requestId,
        toUserId: loginUser._id,
        status: "intrested",
      });

      if (!checkRequest) {
        return res.status(404).json({ message: "No request found" });
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
