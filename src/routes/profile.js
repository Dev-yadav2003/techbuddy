const express = require("express");
const checkAuth = require("../middlewares/checkAuth");
const { validateEditProfileData } = require("../utils/validation");
const authProfile = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");

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
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only .jpeg, .jpg and .png files are allowed"));
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
    const userData = user.toObject();

    if (user.profile) {
      userData.profileUrl = `/uploads/${user.profile}`;
    }

    res.json(userData);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

      if (!validateEditProfileData(req)) {
        throw new Error("Invalid edit fields");
      }

      Object.keys(updates).forEach((key) => {
        if (updates[key] !== undefined) {
          user[key] = updates[key];
        }
      });

      if (req.file) {
        try {
          if (user.profile) {
            const oldImagePath = path.join(uploadDir, user.profile);
            if (fs.existsSync(oldImagePath)) {
              await unlink(oldImagePath);
            }
          }

          user.profile = req.file.filename;
        } catch (err) {
          console.error("Error handling profile image:", err);
          throw new Error("Failed to update profile image");
        }
      }

      await user.save();

      const response = {
        message: "Profile updated successfully",
        user: {
          ...user.toObject(),
          profileUrl: user.profile ? `/uploads/${user.profile}` : null,
        },
      };

      res.json(response);
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(400).json({ error: err.message });
    }
  }
);

module.exports = authProfile;
