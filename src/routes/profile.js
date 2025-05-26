const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const profileRouter = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const User = require("../models/user");

const unlink = util.promisify(fs.unlink);

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only JPEG, JPG and PNG images are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

profileRouter.get("/view", checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Profile view error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

profileRouter.patch(
  "/edit",
  checkAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      const { firstName, lastName, skills, age, gender, about } = req.body;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (skills)
        user.skills = Array.isArray(skills)
          ? skills
          : skills.split(",").map((s) => s.trim());
      if (age) user.age = age;
      if (gender) user.gender = gender;
      if (about) user.about = about;

      if (req.file) {
        if (user.profileImage && !user.profileImage.startsWith("http")) {
          try {
            const oldImagePath = path.join(uploadDir, user.profileImage);
            if (fs.existsSync(oldImagePath)) {
              await unlink(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }

        user.profileImage = req.file.filename;
      }

      await user.save();

      const userResponse = user.toObject();
      delete userResponse.password;

      if (user.profileImage && !user.profileImage.startsWith("http")) {
        userResponse.profileImageUrl = `/uploads/${user.profileImage}`;
      }

      res.json({
        success: true,
        user: userResponse,
      });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to update profile",
      });
    }
  }
);

module.exports = profileRouter;
