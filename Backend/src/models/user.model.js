const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minLength: 6,
    },
    googleId: { 
      type: String 
    },
    authProvider: { 
      type: String, 
      enum: ["local", "google"], 
      default: "local" 
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    otpHash: { 
      type: String, 
      select: false 
    },
    otpExpires: { 
      type: Date 
    },
    otpAttempts: { 
      type: Number, 
      default: 0 
    },
    otpSentAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);