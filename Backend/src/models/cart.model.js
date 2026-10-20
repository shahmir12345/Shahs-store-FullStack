const mongoose = require('mongoose')

/**
 * unique: true: ek user ka sirf ek cart ho sakta hai (1:1 relation).
 * items ek array hai, har item mein product ki id aur quantity.
 * min: 1: quantity 0 ya minus nahi ho sakti. Item hatana ho to delete route use hoga.
 */

const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    items : [
        {
            product : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'Product',
                required : true
            },
            quantity : {
                type : Number,
                required : true, 
                min : 1,
                default : 1
            }
        },
    ],
}, { timestamps : true}
)

module.exports = mongoose.model('Cart', cartSchema)