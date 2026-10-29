const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

// OAuth2Client Google ki library ka class hai jo Google authentication ke kaam aata hai.
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

    /**
     * 400 matlab client ki ghalti.
     * 401 matlab unauthorized.
     * 201 matlab "created".
     * try/catch: koi unexpected error aaye to server crash nahi hota, 500 wapas jata hai.
     */

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashed,
    });

    await sendEmail({
    to: user.email,
    subject: "Welcome to Shah's Store!",
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Start shopping at <a href="https://shahs-store-full-stack-frontend.vercel.app/">Shah's Store</a>.</p>
    `,
     });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: "Invalid Email or Password" });
    }

    if (user.authProvider === "google" || !user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in. Please continue with Google." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Invalid Email or Password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * Explanation: protect ne pehle hi user nikaal kar req.user mein rakh diya hai, isliye yahan database dobara nahi dekhna, seedha wapas bhej do.
 */
exports.getProfile = async (req, res) => {
     res.json(req.user)
}

/** 
 * Yahan frontend backend ko credential naam ki property mein Google ka ID token bhejega.
 * verifyIdToken() token ki authenticity, validity aur audience verify karta hai.
 * audience check karta hai ke token tumhari configured Google application ke liye hai.
 * getPayload() se verified user ki information milti hai.
 * email user ka email hai, name uska naam, sub Google ki unique user ID, aur email_verified batata hai ke Google ne email verify kiya hai ya nahi.
 * Agar email verified nahi hai, to hum login reject karte hain.
*/

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, sub, email_verified } = ticket.getPayload();

    // Agar email verified nahi hai, to hum login reject karte hain.
    if (!email_verified) {
      return res.status(400).json({ message: "Google email is not verified" });
    }


    let user = await userModel.findOne({ googleId: sub });

    if (!user) {
      const emailUser = await userModel.findOne({ email: email.toLowerCase() });

      if (emailUser) {
        return res.status(409).json({
          message: "This email is registered with a password. Please log in with email and password.",
        });
      }

      user = await userModel.create({
        name,
        email,
        googleId: sub,
        authProvider: "google",
      });
    }

    await sendEmail({
        to: user.email,
        subject: "Welcome to Shah's Store!",
        html: `
          <h2>Welcome, ${user.name}!</h2>
          <p>Your account has been created successfully with Google Account.</p>
          <p>Start shopping at <a href="https://shahs-store-full-stack-frontend.vercel.app/">Shah's Store</a>.</p>
        `,
     });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(401).json({ message: "Google sign-in failed" });
  }
};