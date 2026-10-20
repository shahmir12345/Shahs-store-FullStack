const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel = require("../models/admin.model");

const generateAdminToken = (id) => {
  return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      token: generateAdminToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};