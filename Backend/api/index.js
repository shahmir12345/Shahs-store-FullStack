require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../src/app");

let connection = null;

const connectDB = async () => {
  if (connection) return connection;
  connection = mongoose.connect(process.env.MONGO_URI);
  await connection;
  return connection;
};

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    connection = null;
    res.status(500).json({ message: "Database connection failed" });
  }
};