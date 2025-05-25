const mongoose = require("mongoose");
const validate = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
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
      lowercase: true,
      validate(value) {
        const lowerValue = value.toLowerCase();
        if (!["male", "female", "other"].includes(lowerValue)) {
          throw new Error("Please enter valid data");
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
    profileImage: {
      type: String,
      default:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
