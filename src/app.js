const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.use("/test", (req, res) => {
  res.send("Hello, World! test");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
