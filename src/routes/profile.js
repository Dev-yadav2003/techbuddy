const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const authProfile = express.Router();
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
    fileSize: 5 * 1024 * 1024,
  },
});

authProfile.get("/profile/view", checkAuth, async (req, res) => {
  try {
    const user = req.user;
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.profileImage) {
      userData.profileImageUrl = `/uploads/${user.profileImage}`;
    }

    res.json({
      success: true,
      user: userData,
    });
  } catch (err) {
    console.error("Profile view error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

authProfile.patch(
  "/profile/edit",
  checkAuth,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const user = req.user;
      const updates = req.body;

      if (updates.firstName) user.firstName = updates.firstName;
      if (updates.lastName) user.lastName = updates.lastName;

      if (req.file) {
        try {
          if (user.profileImage) {
            const oldImagePath = path.join(uploadDir, user.profileImage);
            if (fs.existsSync(oldImagePath)) {
              await unlink(oldImagePath);
            }
          }

          user.profileImage = req.file.filename;
        } catch (err) {
          console.error("Error handling profile image:", err);
          return res.status(500).json({
            success: false,
            error: "Failed to update profile image",
          });
        }
      }

      await user.save();

      const responseData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        profileImageUrl: user.profileImage
          ? `/uploads/${user.profileImage}`
          : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: responseData,
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

module.exports = authProfile;
