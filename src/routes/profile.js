const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { validateEditProfileData } = require("../utils/validation");
const authProfile = express.Router();

authProfile.get("/profile/view", checkAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

authProfile.patch("/profile/edit", checkAuth, async (req, res) => {
  try {
    const data = req.body;
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit field");
    }
    const user = req.user;
    Object.keys(data).forEach((k) => (user[k] = data[k]));
    await user.save();
    res.send("user updated");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = authProfile;
