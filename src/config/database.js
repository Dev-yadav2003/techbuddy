const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://devNode:wj2uY7TJ90IvavTU@cluster0.fjflg.mongodb.net/techbuddy"
  );
};
module.exports = connectDb;
