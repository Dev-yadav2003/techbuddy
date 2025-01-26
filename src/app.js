const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const authProfile = require("./routes/profile");
app.use("/", authRouter);
app.use("/", authProfile);
connectDb()
  .then(() => {
    console.log("db connected succesfully");
    app.listen(7777, () => {
      console.log(`Server running on port 7777`);
    });
  })
  .catch((err) => {
    console.error("error db cannot connected", err.message);
  });
