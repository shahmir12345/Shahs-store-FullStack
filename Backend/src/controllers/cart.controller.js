const productModel = require('../models/product.model')
const cartModel = require('../models/cart.model')
const mongoose = require('mongoose')

exports.getCart = async (req, res) => {
    try{        
        const cart = await cartModel.findOne({user : req.user._id}).populate('items.product')

        if(!cart){
            return res.json({items : []})
        }

        res.json(cart)
    }catch(err){
        res.status(500).json({message : err.message})
    }
} 

/**
 * Steps in addToCart Function:
 * Body se productId aur quantity le rahe hain. Agar quantity nahi bheji gayi to default 1 hogi.
 * Logged-in user ka cart dhoond rahe hain.
 * Agar user ka cart pehle se nahi hai, to naya cart banayenge.
 *  Cart ke items mein check kar rahe hain: kya requested product pehle se cart mein hai? Agar match mil gaya to 'item' mein woh poora existing, cart item aa jayega:
 * Agar match nahi mila to item = undefined hoga.
 * Agar product already cart mein hai: existing quantity + requested quantity Agar product cart mein nahi hai: 0 + requested quantity
 * Agar product already cart mein tha, // to sirf uski quantity increase/update karo.
 * Agar product cart mein nahi tha, // to items array mein naya item add karo.
 * Cart ke andar product sirf ID ki form mein hota hai. // populate() product ID ki jagah actual product data laata hai.
 */

exports.addToCart = async (req, res) => {
    try{        
        const {productId , quantity = 1} = req.body

        if(!mongoose.isValidObjectId(productId)){
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await productModel.findById(productId)
        if(!product){
            return res.status(404).json({message : 'Product not found'})
        }
        let cart = await cartModel.findOne({user : req.user._id})
        if(!cart){
            cart = new cartModel({user : req.user._id, items : []})
        }

        const item = cart.items.find((item) => item.product.toString() === productId)
        const newQuantity = (item ? item.quantity : 0) + quantity

        if(newQuantity > product.stock){
            return res.status(400).json({message : 'Insufficient stock'})
        }

        if(item){
            item.quantity = newQuantity
        }
        else{
            cart.items.push({product : productId, quantity})
        }

        await cart.save()
        const populated = await cart.populate('items.product')

        res.json(populated)
    } catch(err){
        res.status(400).json({message : err.message})
    }
}

exports.updateQuantity = async (req, res) => {
    try{        
        const {productId} = req.params
        const {quantity} = req.body

        const cart = await cartModel.findOne({user : req.user._id})
        if(!cart){
            return res.status(404).json({message : 'Cart not found'})
        }

        const item = cart.items.find((item) => item.product.toString() === productId)
        if(!item){
            return res.status(404).json({message : 'Item not found in cart'})
        }

        const product = await productModel.findById(productId)
        if(!product){
            return res.status(404).json({message : 'Product not found'})
        }

        if(quantity > product.stock){
            return res.status(400).json({message : 'Insufficient stock'})
        }

        item.quantity = quantity
        await cart.save()
        const populated = await cart.populate('items.product')
        res.json(populated)

    } catch(err){
        res.status(400).json({message : err.message})
    }
}

// filter() ka matlab: Jo items condition pass karein unko rakho. means jo item true return karein unko rakho, false return karein unko hata do.

exports.removeFromCart = async (req, res) => {
    try{        
        const {productId} = req.params

        const cart = await cartModel.findOne({user : req.user._id})
        if(!cart){
            return res.status(404).json({message : 'Cart not found'})
        }

        cart.items = cart.items.filter((item) => item.product.toString() !== productId)
        await cart.save()
        const populated = await cart.populate('items.product')
        res.json(populated)
    } catch(err) {
        res.status(400).json({message : err.message})
    }

}