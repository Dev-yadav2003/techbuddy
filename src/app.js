const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const authProfile = require("./routes/profile");
const request = require("./routes/request");
const userRoute = require("./routes/user");
app.use("/", authRouter);
app.use("/", authProfile);
app.use("/", request);
app.use("/", userRoute);
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
