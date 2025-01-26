const validate = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("please enter name");
  } else if (!emailId) {
    throw new Error("emailId is required");
  } else if (!validate.isEmail(emailId)) {
    throw new Error("Invalid Email Id");
  } else if (!password) {
    throw new Error("password is required");
  } else if (!validate.isStrongPassword(password)) {
    throw new Error("please enter strong password");
  }
};

const validateEditProfileData = (req) => {
  const data = req.body;
  const ALLOWED_FIELDS = [
    "firstName",
    "lastName",
    "skills",
    "about",
    "age",
    "gender",
  ];
  const isAllowed = Object.keys(data).every((k) => ALLOWED_FIELDS.includes(k));
  return isAllowed;
};

module.exports = {
  validateSignupData,
  validateEditProfileData,
};
