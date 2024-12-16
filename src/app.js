const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user");
const app = express();

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "alok",
    lastName: "jha",
    email: "alok@123gmail.com",
    age: "21",
  });
  try {
    await user.save();
    res.send("user data saved");
  } catch (err) {
    res.status(400).send("error in signup", err.message);
  }
});

connectDb()
  .then(() => {
    console.log("db connected succesfully");
    app.listen(3000, () => {
      console.log(`Server running on port 3000`);
    });
  })
  .catch((err) => {
    console.error("error db cannot connected", err.message);
  });
