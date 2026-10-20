const validate = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields are required");
  }

  if (!validate.isEmail(emailId)) {
    throw new Error("Please enter a valid email address");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
};

const ALLOWED_EDIT_FIELDS = [
  "firstName",
  "lastName",
  "skills",
  "about",
  "age",
  "gender",
];

const validateEditProfileData = (req) => {
  return Object.keys(req.body).every((k) => ALLOWED_EDIT_FIELDS.includes(k));
};

// Multipart forms send everything as strings, so turn them back into the
// shapes the User model expects. Empty values clear the field.
const normalizeEditProfileData = (data) => {
  const result = {};
  Object.keys(data).forEach((key) => {
    let value = data[key];
    if (typeof value === "string") value = value.trim();

    if (key === "skills") {
      const list = Array.isArray(value) ? value : String(value).split(",");
      result.skills = list.map((s) => String(s).trim()).filter(Boolean);
    } else if (key === "age" || key === "gender") {
      result[key] = value === "" ? undefined : value;
    } else {
      result[key] = value;
    }
  });
  return result;
};

module.exports = {
  validateSignupData,
  validateEditProfileData,
  normalizeEditProfileData,
};
