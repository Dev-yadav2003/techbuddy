const jwt = require("jsonwebtoken");
const User = require("../models/user");

const checkAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login again (no token)");
    }
    const decodedMessage = jwt.verify(token, JWT_PASSWORD);
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send("Unauthorized: user not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send("Unauthorized: " + err.message);
  }
};

module.exports = checkAuth;
