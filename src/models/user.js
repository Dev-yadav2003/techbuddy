const mongoose = require("mongoose");
const validate = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
      minLength: 2,
    },
    lastName: {
      type: String,
      trim: true,
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
      min: 13,
      max: 150,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female or other",
      },
    },
    about: {
      type: String,
      default: "This is new User to techbuddy",
      maxLength: 300,
    },
    skills: {
      type: [String],
      default: ["JavaScript", "C++", "Java"],
      validate: {
        validator: (value) => value.length <= 10,
        message: "You can add at most 10 skills",
      },
    },
    profile: {
      type: String,
      default:
        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    },
  },
  {
    timestamps: true,
    // Never send the password hash to the client.
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
