const express = require('express')
const router = express.Router()

const {getCart, addToCart, updateQuantity, removeFromCart} = require('../controllers/cart.controller')
const {protect} = require('../middlewares/auth.middleware')
const validateId = require('../middlewares/validateId.middleware')

router.use(protect)

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:productId', validateId("productId"), updateQuantity)
router.delete('/:productId', validateId("productId"), removeFromCart)

module.exports = router