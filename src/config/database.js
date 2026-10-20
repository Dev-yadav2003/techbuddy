const mongoose = require("mongoose");
const { databaseUrl } = require("./env");

const connectDb = async () => {
  await mongoose.connect(databaseUrl);
};
module.exports = connectDb;
