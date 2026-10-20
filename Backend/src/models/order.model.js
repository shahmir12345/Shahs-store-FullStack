const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    
    items : [{
        product : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        name : {
            type : String,
            required : true
        },
        price : {
            type : Number,
            required : true
        },
        quantity : {
            type : Number,
            required : true
        }
    }],
    
    totalPrice : {
        type : Number,
        required : true,
    },
    
    shippingAddress : {
        address : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        phone : {
            type : String,
            required : true
        }
    },
    paymentMethod : {
        type : String,
        enum : ['COD'],
        default : 'COD'
    },
    status : {
        type : String,
        enum : ['pending', 'shipped', 'delivered', 'cancelled'],
        default : 'pending'
    }
}, {timestamps : true})

module.exports = mongoose.model('Order', orderSchema)