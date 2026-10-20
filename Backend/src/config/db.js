const mongoose = require('mongoose')

/**
 * mongoose.connect(...) .env se address le kar database se connect karta hai. await isliye ke yeh time leta hai.
 * process.exit(1): connection ke bagair server chalana bekar hai, isliye app band kar do.
 */

const connectDB = async function(){
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
    } catch (error) {
        console.log(`DataBase Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB