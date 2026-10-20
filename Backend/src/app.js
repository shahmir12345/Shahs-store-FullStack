const express = require('express');
const path = require('path')
const cors = require('cors');

const userRouter = require('./routes/user.routes')
const productRouter = require('./routes/product.routes')
const orderRouter = require('./routes/order.routes')
const cartRouter = require('./routes/cart.routes')
const adminRouter = require("./routes/admin.routes");
const uploadImageRouter = require("./routes/upload.routes")

const app = express()

/**
 * cors(): React (alag port par chalega) ko backend se baat karne ki ijazat deta hai.
 * express.json(): frontend se aane wala JSON data req.body mein padhne layak banata hai. Iske bagair req.body khali aata hai.
 * express() se app banti hai.
 * App ko yahan alag rakha hai aur server.js mein chalayenge, taake code saaf rahe.
 */

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : true}))

// Jab browser is URL ko request karta hai, Express folder mein shoe.png dhoondta hai aur image ka content return karta hai. Isi liye React mein yeh kaam kar sakta hai:
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/upload", uploadImageRouter);
app.use("/admin", adminRouter);
app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

app.get('/', function(req, res){
    res.send('API is running...')
})

module.exports = app