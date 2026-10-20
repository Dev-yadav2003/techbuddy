const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const validate = require("validator");
const { validateSignupData } = require("../utils/validation");
const { setAuthCookie, clearAuthCookie } = require("../utils/auth");
const userAuth = express.Router();

userAuth.post("/signUp", async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, password } = req.body;
    const emailId = req.body.emailId.trim().toLowerCase();

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save();

    setAuthCookie(res, savedUser._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: savedUser,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

userAuth.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const emailId = req.body.emailId?.trim().toLowerCase();

    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    if (!validate.isEmail(emailId)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ emailId });
    const isPasswordMatch =
      user && user.password && (await bcrypt.compare(password, user.password));
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    setAuthCookie(res, user._id);

    res.json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

userAuth.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = userAuth;
