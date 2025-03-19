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
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("user created sucessfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userAuth.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!validate.isEmail(emailId)) {
      throw new Error("Invalid credential");
    }
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credential");
    }

    const token = jwt.sign({ _id: user._id }, "Dev@123", { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: new Date(Date.now() + 60000000),
    });
    res.send(user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userAuth.post("/logout", async (req, res) => {
  const { token } = req.cookies;
  res.cookie("token", token, { expires: new Date(Date.now()) });
  res.send("user logged out");
});

module.exports = userAuth;
