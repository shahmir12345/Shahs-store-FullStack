const express = require('express')
const router = express.Router()

const {getProducts, getProductsById, createProduct, updateProduct, deleteProduct} = require('../controllers/product.controller')
const {protect, protectAdmin} = require('../middlewares/auth.middleware')
const validateId = require('../middlewares/validateId.middleware')

router.get('/', getProducts)
router.get('/:id', validateId("id"), getProductsById)

router.post('/', protectAdmin, createProduct)
router.put('/:id', protectAdmin, validateId("id"), updateProduct)
router.delete('/:id',  protectAdmin, validateId("id"), deleteProduct)

module.exports = router