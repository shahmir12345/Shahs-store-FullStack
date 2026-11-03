const express = require('express');
const path = require('path')
const cors = require('cors');

const userRouter = require('./routes/user.routes')
const productRouter = require('./routes/product.routes')
const orderRouter = require('./routes/order.routes')
const cartRouter = require('./routes/cart.routes')
const adminRouter = require("./routes/admin.routes");
const uploadImageRouter = require("./routes/upload.routes")
const aiRouter = require("./routes/ai.routes")

const app = express()

/**
 * cors(): React (alag port par chalega) ko backend se baat karne ki ijazat deta hai.
 * express.json(): frontend se aane wala JSON data req.body mein padhne layak banata hai. Iske bagair req.body khali aata hai.
 * express() se app banti hai.
 * App ko yahan alag rakha hai aur server.js mein chalayenge, taake code saaf rahe.
 */

app.set("trust proxy", 1);

const allowedOrigins = [ process.env.CLIENT_URL,"http://localhost:5173",].filter(Boolean);
app.use(
  cors({origin: allowedOrigins,})
);

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, 'public')))

// Jab browser is URL ko request karta hai, Express folder mein shoe.png dhoondta hai aur image ka content return karta hai. Isi liye React mein yeh kaam kar sakta hai:
app.use("/upload", uploadImageRouter);
app.use("/admin", adminRouter);
app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)
app.use("/ai", aiRouter);

app.get('/', function(req, res){
    res.send('API is running...')
})

module.exports = app