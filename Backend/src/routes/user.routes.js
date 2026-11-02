const express = require('express');
const router = express.Router();

/**
 * require() se poora exported object milta hai.
 * Destructuring ya dot (.) se us object ki specific property/function le sakte hain.
 * Options : 
 * 1. const userController = require('../controllers/user.controller')
 *          userController.register
 *          userController.login
 * 2. const {register, login} = require('../controllers/user.controller')
 * 3. const { register: registerUser } = require('../controllers/user.controller') for Renaming 
 */
const {register, login, getProfile, verifyEmail, resendOtp} = require('../controllers/user.controller')
const {protect} = require('../middlewares/auth.middleware')
const {googleLogin} = require("../controllers/user.controller")
const {authLimiter, otpLimiter} = require("../middlewares/rateLimit.middleware")
const {forgotPassword, resetPassword} = require("../controllers/user.controller");

router.post("/verify-email", otpLimiter, verifyEmail);
router.post("/resend-otp", otpLimiter, resendOtp);
router.post("/google", authLimiter, googleLogin);
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", otpLimiter, resetPassword);
// protect → user ko identify karke req.user mein rakhta hai.
// getProfile → us already-found user ko response mein bhej deta hai.
router.post('/profile', protect, getProfile) // protect middleware se user ko authenticate karte hain, agar token valid hai to getProfile chalega.
module.exports = router