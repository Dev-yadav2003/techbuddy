const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const Connection = require("../models/connection");

const userRoute = express.Router();

userRoute.get("/user/request", checkAuth, async (req, res) => {
  try {
    const loginUser = req.user;
    const allRequests = await Connection.find({
      toUserId: loginUser._id,
      status: "intrested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "about",
      "gender",
      "skills",
    ]);
    return res.json({ message: "all requests :", data: allRequests });
  } catch (err) {
    return res.status(400).json({ Error: err.message });
  }
});

module.exports = userRoute;
