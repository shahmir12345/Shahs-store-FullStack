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
const {register, login, getProfile} = require('../controllers/user.controller')
const {adminLogin} = require('../controllers/admin.controller')
const {protect} = require('../middlewares/auth.middleware')
const {googleLogin} = require("../controllers/user.controller")

router.post("/google", googleLogin);
router.post('/register', register)
router.post('/login', login)
router.post("/admin/login", adminLogin);
// protect → user ko identify karke req.user mein rakhta hai.
// getProfile → us already-found user ko response mein bhej deta hai.
router.post('/profile', protect, getProfile) // protect middleware se user ko authenticate karte hain, agar token valid hai to getProfile chalega.
module.exports = router