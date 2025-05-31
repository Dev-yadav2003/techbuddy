const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { validateEditProfileData } = require("../utils/validation");
const upload = require("../utils/multer");
const authProfile = express.Router();

authProfile.get("/profile/view", checkAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

authProfile.patch(
  "/profile/edit",
  checkAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const data = req.body;
      const user = req.user;

      if (!validateEditProfileData(req)) {
        throw new Error("Invalid Edit field");
      }

      Object.keys(data).forEach((key) => {
        user[key] = data[key];
      });

      if (req.file) {
        user.profile = req.file.filename;
      }

      await user.save();

      res.send({ message: "User updated", data: user });
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  }
);

module.exports = authProfile;
