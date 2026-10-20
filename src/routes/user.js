const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const Connection = require("../models/connection");
const User = require("../models/user");

const userRoute = express.Router();
const USER_DATA = [
  "firstName",
  "lastName",
  "about",
  "age",
  "gender",
  "skills",
  "profile",
];

userRoute.get("/user/request", checkAuth, async (req, res) => {
  try {
    const loginUser = req.user;
    const allRequests = await Connection.find({
      toUserId: loginUser._id,
      status: "intrested",
    })
      .sort({ createdAt: -1 })
      .populate("fromUserId", USER_DATA);
    // Skip requests whose sender account no longer exists.
    const data = allRequests.filter((row) => row.fromUserId);
    return res.json({ message: "all requests", data });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

userRoute.get("/user/connection", checkAuth, async (req, res) => {
  try {
    const loginUser = req.user;
    const getConnections = await Connection.find({
      $or: [
        {
          toUserId: loginUser._id,
          status: "accepted",
        },
        { fromUserId: loginUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_DATA)
      .populate("toUserId", USER_DATA);
    const data = getConnections
      .filter((row) => row.fromUserId && row.toUserId)
      .map((row) => {
        if (row.fromUserId._id.equals(loginUser._id)) {
          return row.toUserId;
        }
        return row.fromUserId;
      });
    return res.json({ data });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

userRoute.get("/user/feed", checkAuth, async (req, res) => {
  try {
    const loginUser = req.user;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const allRequests = await Connection.find({
      $or: [{ toUserId: loginUser._id }, { fromUserId: loginUser._id }],
    }).select("fromUserId toUserId");

    const hiddenUsers = new Set([loginUser._id.toString()]);
    allRequests.forEach((row) => {
      hiddenUsers.add(row.fromUserId.toString());
      hiddenUsers.add(row.toUserId.toString());
    });

    const userFeed = await User.find({
      _id: { $nin: Array.from(hiddenUsers) },
    })
      .select(USER_DATA)
      .skip(skip)
      .limit(limit);

    return res.json({ data: userFeed });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = userRoute;
