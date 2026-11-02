const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { issueOtp, checkOtp, secondsUntilResend, MAX_ATTEMPTS } = require("../utils/otp");

// OAuth2Client Google ki library ka class hai jo Google authentication ke kaam aata hai.
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const RESET_TTL_MS = 15 * 60 * 1000;
const RESET_GAP_MS = 60 * 1000;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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
    const { name, password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(password, 10);
    let user = await userModel.findOne({ email });

    if (user && (user.isVerified || user.authProvider === "google")) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (user) {
      user.name = name;
      user.password = hashed;
      const wait = secondsUntilResend(user);
      if (wait > 0) {
        return res.status(429).json({ message: `Please wait ${wait}s before requesting a new code`, retryAfter: wait });
      }
    } else {
      user = new userModel({ name, email, password: hashed });
    }

    await issueOtp(user);

    res.status(201).json({
      message: "Verification code sent to your email",
      email: user.email,
      needsVerification: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await userModel.findOne({ email }).select("+otpHash");
    if (!user || user.isVerified || !user.otpHash) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    if (user.otpExpires < new Date()) {
      user.otpHash = undefined;
      await user.save();
      return res.status(400).json({ message: "Code expired. Please request a new one." });
    }

    if (!checkOtp(user, otp)) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= MAX_ATTEMPTS) {
        user.otpHash = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.status(429).json({ message: "Too many attempts. Please request a new code." });
      }
      await user.save();
      return res.status(400).json({
        message: `Incorrect code. ${MAX_ATTEMPTS - user.otpAttempts} attempts left.`,
      });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Welcome to MyStore!",
      html: `<h2>Welcome, ${user.name}!</h2><p>Your email is verified. Happy shopping!</p>`,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: true,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const user = email ? await userModel.findOne({ email }) : null;

    if (user && !user.isVerified && user.authProvider !== "google") {
      const wait = secondsUntilResend(user);
      if (wait > 0) {
        return res.status(429).json({ message: `Please wait ${wait}s before requesting a new code`, retryAfter: wait });
      }
      await issueOtp(user);
    }

    res.json({ message: "If the account exists, a new code has been sent" });
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

    if (!user.isVerified) {
    const wait = secondsUntilResend(user);
    if (wait === 0) await issueOtp(user);
    return res.status(403).json({
      message: "Please verify your email. We sent you a code.",
      needsVerification: true,
      email: user.email,
    });
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
        isVerified: true,
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

exports.forgotPassword = async (req, res) => {
  const reply = { message: "If this email is registered, we sent a reset link." };

  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) return res.json(reply);

    if (user.authProvider === "google" || !user.password) {
      await sendEmail({
        to: user.email,
        subject: "Password reset request",
        html: `<h2>Password reset</h2>
          <p>Your account uses Google sign-in, so it has no password to reset.</p>
          <p>Please log in with the "Continue with Google" button.</p>`,
      });
      return res.json(reply);
    }

    if (user.resetTokenExpires) {
      const sentAt = user.resetTokenExpires.getTime() - RESET_TTL_MS;
      if (Date.now() - sentAt < RESET_GAP_MS) return res.json(reply);
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = hashToken(token);
    user.resetTokenExpires = new Date(Date.now() + RESET_TTL_MS);
    await user.save();

    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Reset your password</h2>
        <p>Click the button below to choose a new password. This link expires in 15 minutes and works only once.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#ea580c;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Reset password</a>
        </p>
        <p style="font-size:13px;color:#64748b">If the button does not work, copy this link:<br>${link}</p>
        <p style="font-size:13px;color:#64748b">If you did not ask for this, you can ignore this email.</p>
      `,
    });

    res.json(reply);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await userModel.findOne({
      resetTokenHash: hashToken(String(token)),
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user || user.authProvider === "google") {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordChangedAt = new Date();
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.json({ message: "Password updated. You can log in now." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};