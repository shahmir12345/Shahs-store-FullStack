const multer = require("multer");

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG or WEBP images are allowed"));
};

module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});