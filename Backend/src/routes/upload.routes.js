const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const cloudinary = require("../config/cloudinary");
const { protectAdmin } = require("../middlewares/auth.middleware");

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mystore/products" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

router.post("/", protectAdmin, (req, res) => {
  upload.array("images", 5)(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    try {
      const results = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer))
      );
      res.json({ urls: results.map((r) => r.secure_url) });
    } catch (error) {
        console.error("Cloudinary error:", error);
        res.status(500).json({ message: error.message || "Image upload failed" });
    }
  });
});

module.exports = router;