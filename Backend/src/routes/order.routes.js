const express = require('express')
const router = express.Router()

const {createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus} = require('../controllers/order.controller')
const {protect, protectAdmin} = require('../middlewares/auth.middleware')
const validateId = require('../middlewares/validateId.middleware')

// /my ko /:id se pehle likhna zaroori hai. Warna Express my ko bhi id samajh kar getOrderById chala dega aur error aayega. Yahi wo order wali baat thi jo pehle kahi thi.


// router.use(protect) // yeh saare routes ke liye authentication check karega             

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)

router.get('/', protectAdmin, getAllOrders) // adminOnly middleware sirf admin users ko allow karega

router.get('/:id', protect, validateId("id"), getOrderById)
router.put('/:id/status', protectAdmin, validateId("id"), updateOrderStatus) // adminOnly middleware sirf admin users ko allow karega

module.exports = router