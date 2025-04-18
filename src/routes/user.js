const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const Connection = require("../models/connection");
const User = require("../models/user");
const { connections } = require("mongoose");

const userRoute = express.Router();
const USER_DATA = [
  "firstName",
  "lastName",
  "about",
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
    }).populate("fromUserId", USER_DATA);
    return res.json({ message: "all requests :", data: allRequests });
  } catch (err) {
    return res.status(400).json({ Error: err.message });
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
    const data = getConnections.map((row) => {
      if (row.fromUserId._id.toString() === loginUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    return res.send(data);
  } catch (err) {
    return res.status(400).json({ Error: err.message });
  }
});

userRoute.get("/user/feed", checkAuth, async (req, res) => {
  try {
    const loginUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    const skip = (page - 1) * limit;

    const allRequests = await Connection.find({
      $or: [{ toUserId: loginUser._id }, { fromUserId: loginUser._id }],
    }).select("fromUserId toUserId");

    const hiddenUsers = new Set();
    allRequests.forEach((req) => {
      hiddenUsers.add(req.fromUserId.toString());
      hiddenUsers.add(req.toUserId.toString());
    });

    const userFeed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUsers) } },
        { _id: { $ne: loginUser._id } },
      ],
    })
      .select(USER_DATA)
      .skip(skip)
      .limit(limit);

    return res.json({ data: userFeed });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = userRoute;
