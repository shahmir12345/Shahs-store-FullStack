const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const cartModel = require("../models/cart.model");
const sendEmail = require("../utils/sendEmail");

// createOrder cart ko validate karta hai → cart ke products aur stock check karta hai → order ka snapshot banata hai
//  → total calculate karta hai → order save karta hai → stock reduce karta hai → cart empty karta hai.

exports.createOrder = async (req, res) => {
    try {
        const {shippingAddress} = req.body

        if(!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone){
            return res.status(400).json({message: 'Shipping Address is required'})
        }

        //populate ki wajah se cart.items.product ke andar product ka pura document aa jaayega, jisme stock aur price bhi hoga.
        const cart = await cartModel.findOne({user : req.user._id}).populate('items.product')
        if(!cart || cart.items.length === 0){
            return res.status(400).json({message: 'Cart is empty'})
        }

        let totalPrice = 0

        // yeh order main items ko organize kar raha hai, aur yeh orders schema ke andar items array ke format ke hisaab se bana raha hai means product, name, price, quantity. aur neechay Order create kar raha hai aur aus main items field ko orderItems array se populate kar raha hai 
        let orderItems = []

        for(const item of cart.items){
            const product = item.product
            
            if(!product){
                return res.status(400).json({message: `Product not found for item ${item._id}`})
            }

            if(item.quantity > product.stock){
                return res.status(400).json({message: `Insufficient stock for product ${product.name}`})
            }

            orderItems.push({
                product : product._id,
                name : product.name,
                price : product.price,
                quantity : item.quantity
            })

            totalPrice = totalPrice + (product.price * item.quantity)
        }

        const order = await orderModel.create({
            user : req.user._id,
            items : orderItems,
            totalPrice,
            shippingAddress,
        })

        for(const item of cart.items){
            await productModel.findByIdAndUpdate(item.product, 
                {$inc : {stock : -item.quantity}}
            )
        }

        cart.items = []
        await cart.save()

        const rows = orderItems
        .map(
            (i) =>
            `<tr><td>${i.name} x ${i.quantity}</td><td align="right">Rs. ${(i.price * i.quantity).toLocaleString()}</td></tr>`
        )
        .join("");

        await sendEmail({
        to: req.user.email,
        subject: `Order confirmed #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
            <h2>Thank you for your order, ${req.user.name}!</h2>
            <table width="100%" cellpadding="6">${rows}</table>
            <p><strong>Total: Rs. ${totalPrice.toLocaleString()}</strong></p>
            <p>Delivery to: ${shippingAddress.address}, ${shippingAddress.city} (${shippingAddress.phone})</p>
            <p>Payment: Cash on Delivery</p>
        `,
        });

        res.status(201).json(order)

    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

//yeh loggedIn user ke saaray orders ko fetch karta hai aur unko sort karta hai descending order main (latest order pehle aayega)

exports.getMyOrders = async (req, res) => {
    try{
        const order = await orderModel.find({user : req.user._id}).sort({createdAt : -1})

        res.status(200).json(order)

    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

//yeh kisi specific order ko fetch karta hai by id aur check karta hai ki loggedIn user ka order hai ya nahi, agar nahi hai tu admin access kar sakta hai otherwise forbidden.
// → Logged-in user apna order, aur admin kisi ka order dekh sakta hai. by id

exports.getOrderById = async (req, res) => {
    try{
        const order = await orderModel.findById(req.params.id).populate('user', 'name email')

        if(!order){
            return res.status(404).json({message: 'Order not found'})
        }

        const isLoggedIn = order.user._id.toString() === req.user._id.toString()

//agar LoggedIn user hai tu access kar sakta hai (condition false) and agar admin hai tu wo bhi access kar sakta hai (condition false) otherwise forbidden

        if(!isLoggedIn && req.user.role !== 'admin'){
            return res.status(403).json({message: 'Forbidden, Not allowed to view this order'})
        }

        res.status(200).json(order)

    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

// yeh saaray orders ko fetch karta hai aur unko sort karta hai descending order main (latest order pehle aayega) aur user ke name aur email ko populate karta hai. ye function sirf admin access kar sakta hai.

exports.getAllOrders = async (req, res) => {
    try {    
        const order = await orderModel.find().populate('user', 'name email').sort({createdAt : -1})

        if(!order){
            return res.status(404).json({message: 'No orders found'})
        }

        res.status(200).json(order)
    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}

/** 
 * Admin status bhejta hai: pending, shipped, delivered, cancelled.
 * Pehle check hota hai status valid hai ya nahi.
 * Order ID se order find hota hai.
 * Agar order cancel ho aur pehle cancelled na ho → ordered products ka stock wapas increase hota hai.
 * Phir order.status = status karke order save hota hai.
 * Purpose: order ka status update karna aur cancellation par stock restore karna.
*/

exports.updateOrderStatus = async (req, res) => {
    try {
        const {status} = req.body
        const allowedStatus = ['pending', 'shipped', 'delivered', 'cancelled']

        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: 'Invalid status'})
        }

        const order = await orderModel.findById(req.params.id)
        if(!order){
            return res.status(404).json({message: 'Order not found'})
        }

        if(status === 'cancelled' && order.status !== 'cancelled'){
            for(item of order.items){
                await productModel.findByIdAndUpdate(item.product,
                    {$inc : {stock : item.quantity}}
                )
            }
        }

        order.status = status
        await order.save()
        res.status(200).json(order)

    } catch (error) {
        res.status(500).json({message: 'Server Error', error: error.message})
    }
}