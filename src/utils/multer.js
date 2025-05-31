const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const uploadPath = path.join(__dirname, "../public/profileImage/upload");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, buf) => {
      if (err) return cb(err);
      const filename = buf.toString("hex") + path.extname(file.originalname);
      cb(null, filename);
    });
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
