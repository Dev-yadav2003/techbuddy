const { port, corsOrigins } = require("./config/env");
const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const http = require("http");

const app = express();
const initializeSocket = require("./utils/socket");

// Needed for secure cookies behind a proxy (Render, Railway, Heroku, ...).
app.set("trust proxy", 1);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use("/upload", express.static(path.join(__dirname, "../upload")));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const authProfile = require("./routes/profile");
const request = require("./routes/request");
const userRoute = require("./routes/user");
const chatRoute = require("./routes/chat");

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/", authRouter);
app.use("/", authProfile);
app.use("/", request);
app.use("/", userRoute);
app.use("/", chatRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);
initializeSocket(server);

connectDb()
  .then(() => {
    console.log("DB connected successfully");
    server.listen(port, () => {
      console.log("Server started on port " + port);
      console.log("Allowed origins: " + corsOrigins.join(", "));
    });
  })
  .catch((err) => {
    console.error("Error: DB connection failed", err.message);
    process.exit(1);
  });
