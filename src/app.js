const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

const app = express();
const initializeSocket = require("./utils/socket");

app.use(
  cors({
    origin: "https://techbuddy-frontend.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRouter = require("./routes/auth");
const authProfile = require("./routes/profile");
const request = require("./routes/request");
const userRoute = require("./routes/user");

app.use("/", authRouter);
app.use("/", authProfile);
app.use("/", request);
app.use("/", userRoute);

const server = http.createServer(app);
initializeSocket(server);

connectDb()
  .then(() => {
    console.log("DB connected successfully");
    server.listen(process.env.PORT, () => {
      console.log("Server started on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("Error: DB connection failed", err.message);
  });
