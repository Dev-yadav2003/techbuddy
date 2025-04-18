const jwt = require("jsonwebtoken");
const User = require("../models/user");

const checkAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("please login again");
    }
    const decodedMessage = jwt.verify(token, process.env.JWT_PASSWORD);
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};
module.exports = checkAuth;
