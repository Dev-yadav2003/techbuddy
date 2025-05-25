const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const authProfile = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const User = require("../models/user");

const unlink = util.promisify(fs.unlink);

// Configure upload directory
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
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

// File filter for image uploads
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

// Get profile
authProfile.get("/profile/view", checkAuth, async (req, res) => {
  try {
    const user = req.user;
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      skills: user.skills,
      age: user.age,
      gender: user.gender,
      about: user.about,
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
  upload.single("profile"),
  async (req, res) => {
    try {
      const user = req.user;
      const updates = req.body;

      const allowedFields = [
        "firstName",
        "lastName",
        "skills",
        "age",
        "gender",
        "about",
      ];
      allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
          user[field] = updates[field];
        }
      });

      if (req.file) {
        try {
          if (user.profileImage && !user.profileImage.includes("daisyui.com")) {
            const oldImagePath = path.join(uploadDir, user.profileImage);
            if (fs.existsSync(oldImagePath)) {
              await unlink(oldImagePath);
            }
          }

          user.profileImage = req.file.filename;
        } catch (err) {
          console.error("Image processing error:", err);
          return res.status(500).json({
            success: false,
            error: "Failed to update profile image",
          });
        }
      }

      const savedUser = await user.save();

      const responseData = {
        _id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        emailId: savedUser.emailId,
        skills: savedUser.skills,
        age: savedUser.age,
        gender: savedUser.gender,
        about: savedUser.about,
        profileImageUrl: savedUser.profileImage
          ? `/uploads/${savedUser.profileImage}`
          : savedUser.profileImage,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
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
