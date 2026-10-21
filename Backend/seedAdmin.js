require("dotenv").config();
if (process.env.NODE_ENV !== "production") {
  require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
}
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const adminModel = require("./src/models/admin.model");

const run = async () => {
  if (
    !process.env.ADMIN_NAME ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.MONGO_URI
  ) {
    throw new Error("Required environment variables are missing");
  }
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL;
  const exists = await adminModel.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    return process.exit(0);
  }

  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await adminModel.create({ name: process.env.ADMIN_NAME, email, password });

  console.log("Admin created:", email);
  process.exit(0);
};

run();