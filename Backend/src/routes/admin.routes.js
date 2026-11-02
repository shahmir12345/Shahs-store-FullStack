const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/admin.controller");
const {authLimiter} = require("../middlewares/rateLimit.middleware")

router.post("/login", authLimiter, adminLogin);

module.exports = router;