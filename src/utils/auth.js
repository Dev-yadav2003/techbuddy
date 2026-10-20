const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { jwtSecret, isProduction } = require("../config/env");

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const setAuthCookie = (res, userId) => {
  const token = jwt.sign({ _id: userId }, jwtSecret, { expiresIn: "1d" });
  res.cookie("token", token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
};

// clearCookie only works when the options match the ones the cookie was set with.
const clearAuthCookie = (res) => {
  res.clearCookie("token", cookieOptions);
};

const getUserFromToken = async (token) => {
  const { _id } = jwt.verify(token, jwtSecret);
  return User.findById(_id);
};

module.exports = { setAuthCookie, clearAuthCookie, getUserFromToken };
