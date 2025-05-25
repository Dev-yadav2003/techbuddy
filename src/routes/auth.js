const express = require("express");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validate = require("validator");
const jwt = require("jsonwebtoken");
const userAuth = express.Router();

userAuth.post("/signUp", async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Email and password are required");
    }
    if (!validate.isEmail(emailId)) {
      throw new Error("Invalid email");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const saveUser = await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PASSWORD, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + 60000000),
    });

    res.json({ message: "User created successfully", data: saveUser });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userAuth.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    console.log("Login request body:", req.body);

    if (!emailId || !password) {
      throw new Error("Email and password are required");
    }
    if (!validate.isEmail(emailId)) {
      throw new Error("Invalid credential");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found. Please sign up.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid credential");
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_PASSWORD, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + 60000000),
    });

    res.send(user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userAuth.post("/logout", async (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.send("User logged out");
});

module.exports = userAuth;
