/**
 * dotenv.config() sabse upar ho, taake .env ki values process.env mein load ho jayein, warna baaki files unhein nahi dekh payengi.
 */
require('dotenv').config()
if (process.env.NODE_ENV !== "production") {
  require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
}

const app = require('./src/app')
const connectDB = require('./src/config/db')

PORT = process.env.PORT || 5000

connectDB()

app.listen(PORT, function(){
    console.log(`Server is running on port ${PORT}`)
})