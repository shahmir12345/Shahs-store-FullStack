import multer, { memoryStorage } from "multer";

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG or WEBP images are allowed"));
};

export default multer({
  storage: memoryStorage(),
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 },
});