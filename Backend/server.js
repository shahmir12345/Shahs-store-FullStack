/**
 * dotenv.config() sabse upar ho, taake .env ki values process.env mein load ho jayein, warna baaki files unhein nahi dekh payengi.
 */
require('dotenv').config()

const app = require('./src/app')
const connectDB = require('./src/config/db')

PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, function(){
    console.log(`Server is running on port ${PORT}`)
})