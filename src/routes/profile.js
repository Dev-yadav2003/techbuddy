const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const {
  validateEditProfileData,
  normalizeEditProfileData,
} = require("../utils/validation");
const upload = require("../utils/multer");

const authProfile = express.Router();

authProfile.get("/profile/view", checkAuth, async (req, res) => {
  res.json(req.user);
});

authProfile.patch(
  "/profile/edit",
  checkAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = req.user;

      if (!validateEditProfileData(req)) {
        throw new Error("Invalid edit field(s)");
      }

      const data = normalizeEditProfileData(req.body);
      Object.keys(data).forEach((key) => {
        user[key] = data[key];
      });

      if (req.file) {
        user.profile = `/upload/${req.file.filename}`;
      }

      await user.save();

      res.json({ message: "User updated", data: user });
    } catch (err) {
      console.error("Profile update error:", err.message);
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = authProfile;
