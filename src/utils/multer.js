const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../../upload");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, buf) => {
      if (err) return cb(err);
      const filename = buf.toString("hex") + path.extname(file.originalname);
      cb(null, filename);
    });
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
