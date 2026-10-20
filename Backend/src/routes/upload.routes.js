const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { protectAdmin } = require("../middlewares/auth.middleware");

//means 5 images daal saktay hun max aik product ki
router.post("/", protectAdmin, (req, res) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    //har file ka url banata hai: "http://localhost:5000/uploads/1792422345678-123.png",

    const urls = req.files.map(
      (f) => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`
    );
    res.json({ urls });
  });
});

module.exports = router;