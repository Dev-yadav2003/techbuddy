const express = require("express");
const app = express();

app.use(
  "/user",
  (req, res, next) => {
    console.log("route handler one");
    next();
  },
  (req, res, next) => {
    console.log("route handler two");
    next();
    res.send("response");
  },
  (req, res) => {
    console.log("route handler three");
    res.send("response2");
  }
);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
