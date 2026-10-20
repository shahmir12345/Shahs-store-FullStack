const multer = require("multer");
const path = require("path");
const fs = require("fs");

//yahan folder create ho raha hai jahan files save hongi
const dir = path.join(__dirname, "../../uploads");
fs.mkdirSync(dir, { recursive: true });

//kahan images ko save karni hai aur kia naam dena hai ,unique name using Date and random number
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

//kon kon si file extensions accept karni hai
const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG or WEBP images are allowed"));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});