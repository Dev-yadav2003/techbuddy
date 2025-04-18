const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const initializeSocket = require("./utils/socket");
const http = require("http");
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
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

const server = http.createServer(app);
initializeSocket(server);
connectDb()
  .then(() => {
    console.log("DB connected successfully");
    server.listen(process.env.PORT, () => {
      console.log("Server start running");
    });
  })
  .catch((err) => {
    console.error("Error: DB connection failed", err.message);
  });
