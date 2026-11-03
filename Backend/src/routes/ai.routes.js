const express = require("express");
const router = express.Router();
const { generateDescription } = require("../controllers/ai.controller");
const { protectAdmin } = require("../middlewares/auth.middleware");
const { aiLimiter } = require("../middlewares/rateLimit.middleware");

router.post("/description", aiLimiter, protectAdmin, generateDescription);

module.exports = router;