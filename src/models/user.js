const mongoose = require("mongoose");
const validate = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
    maxLength: 50,
    minLength: 2,
  },
  lastName: {
    type: String,
    maxLength: 50,
    minLength: 2,
  },
  password: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validate.isEmail(value)) {
        throw new Error("Give correct Email Id");
      }
    },
  },
  age: {
    type: Number,
    max: 150,
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "other"].includes(value)) {
        throw new Error("please enter valid data");
      }
    },
  },
  about: {
    type: String,
    default: "This is new User to techbuddy",
    maxLength: 150,
  },
  skills: {
    type: [String],
    default: ["javaScript", "CPP", "Java"],
    maxLength: 10,
  },
});

module.exports = mongoose.model("User", userSchema);
