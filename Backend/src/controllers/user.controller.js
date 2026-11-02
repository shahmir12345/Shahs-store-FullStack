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
      subject: "Welcome to Shah's Store – Your Shopping Journey Begins!",
      html: `
        <div style="text-align:center;">
          <h2 style="color:#153F35;font-size:25px;margin-bottom:12px;">
            Welcome to Shah's Store, ${user.name}!
          </h2>

          <p style="font-size:16px;color:#334155;">
            We're excited to have you here!
          </p>
        </div>

        <p>
          Your email address has been successfully verified, and your account
          is now ready to use. You're officially part of the Shah's Store family!
        </p>

        <p>
          Discover products you'll love, explore our latest collections, and
          enjoy a smooth and convenient shopping experience — all in one place.
        </p>

        <div style="background:#f0fdf4;border-left:4px solid #1F6F5C;padding:14px 16px;margin:24px 0;border-radius:6px;">
          <strong style="color:#153F35;">Your account is ready!</strong>
          <p style="margin:6px 0 0;color:#334155;">
            You can now sign in, explore our store, add products to your cart,
            and place your orders.
          </p>
        </div>

        <div style="text-align:center;margin:28px 0;">
          <a
            href="https://shahs-store-full-stack-frontend.vercel.app/"
            style="display:inline-block;background:#153F35;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:bold;"
          >
            Start Shopping
          </a>
        </div>

        <p>
          Thank you for choosing Shah's Store. We look forward to being
          part of your shopping experience!
        </p>

        <p style="margin-top:24px;">
          Happy Shopping!<br/>
          <strong style="color:#153F35;">Team Shah's Store</strong>
        </p>
      `
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
      subject: "Welcome to Shah's Store – Your Shopping Journey Begins!",
      html: `
        <div style="text-align:center;">
          <h2 style="color:#153F35;font-size:25px;margin-bottom:12px;">
            Welcome to Shah's Store, ${user.name}!
          </h2>

          <p style="font-size:16px;color:#334155;">
            We're delighted to have you on board!
          </p>
        </div>

        <p>
          Your Shah's Store account has been successfully created using your
          Google Account. We're excited to welcome you to our shopping community!
        </p>

        <p>
          Your account is ready, and you can now explore our collection,
          discover products you love, and enjoy a smooth and convenient
          shopping experience.
        </p>

        <div style="background:#f0fdf4;border-left:4px solid #1F6F5C;padding:14px 16px;margin:24px 0;border-radius:6px;">
          <strong style="color:#153F35;">You're all set!</strong>
          <p style="margin:6px 0 0;color:#334155;">
            Simply sign in using your Google Account whenever you want to
            explore our store or manage your orders.
          </p>
        </div>

        <div style="text-align:center;margin:28px 0;">
          <a
            href="https://shahs-store-full-stack-frontend.vercel.app/"
            style="display:inline-block;background:#153F35;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:bold;"
          >
            Start Shopping
          </a>
        </div>

        <p>
          Thank you for choosing Shah's Store. We look forward to making
          your shopping experience enjoyable!
        </p>

        <p style="margin-top:24px;">
          Happy Shopping!<br/>
          <strong style="color:#153F35;">Team Shah's Store</strong>
        </p>
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
        subject: "Your Account Uses Google Sign-In – Shah's Store",
        html: `
          <div style="text-align:center;">
            <h2 style="color:#153F35;font-size:25px;margin-bottom:12px;">
              No Password Reset Needed!
            </h2>

            <p style="font-size:16px;color:#334155;">
              Your Shah's Store account is linked to Google.
            </p>
          </div>

          <p>
            We received a request to reset the password associated with
            your Shah's Store account.
          </p>

          <p>
            However, your account was created using <strong>Google Sign-In</strong>,
            which means you don't have a separate Shah's Store password to reset.
          </p>

          <div style="background:#f0fdf4;border-left:4px solid #1F6F5C;padding:14px 16px;margin:24px 0;border-radius:6px;">
            <strong style="color:#153F35;">Your account is already set up!</strong>

            <p style="margin:6px 0 0;color:#334155;">
              You can continue accessing your Shah's Store account securely
              by signing in with the same Google Account you used when
              creating your account.
            </p>
          </div>

          <div style="text-align:center;margin:28px 0;">
            <a
              href="https://shahs-store-full-stack-frontend.vercel.app/login"
              style="display:inline-block;background:#153F35;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:bold;"
            >
              Continue with Google
            </a>
          </div>

          <p>
            If you didn't request a password reset, no action is needed.
            Your account remains safe and unchanged.
          </p>

          <p style="margin-top:24px;">
            Thank you for choosing Shah's Store!<br/>
            <strong style="color:#153F35;">Team Shah's Store</strong>
          </p>
        `,
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
      subject: "Password Reset Request – Shah's Store",
      html: `
        <div style="text-align:center;">
          <h2 style="color:#153F35;font-size:25px;margin-bottom:12px;">
            Reset Your Password
          </h2>

          <p style="font-size:16px;color:#334155;">
            Let's get you back into your account!
          </p>
        </div>

        <p>
          We received a request to reset the password associated with your
          Shah's Store account. No worries! You can create a new password
          by clicking the button below.
        </p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:20px 16px;margin:24px 0;border-radius:10px;text-align:center;">
          <h3 style="color:#153F35;margin:0 0 10px;">
            Password Reset Request
          </h3>

          <p style="color:#475569;margin:0;">
            Click the button below to securely choose a new password
            for your account.
          </p>

          <div style="margin:24px 0 8px;">
            <a
              href="${link}"
              style="display:inline-block;background:#153F35;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:6px;font-weight:bold;font-size:15px;"
            >
              Reset Password
            </a>
          </div>
        </div>

        <div style="background:#fff7ed;border-left:4px solid #E2982F;padding:14px 16px;margin:24px 0;border-radius:6px;">
          <strong style="color:#9a5b0a;">Important: Link Expiry</strong>

          <p style="margin:6px 0 0;color:#7c5a32;">
            For your security, this password reset link expires in
            <strong>15 minutes</strong> and can only be used once.
            Please complete the process before it expires.
          </p>
        </div>

        <p style="color:#334155;">
          <strong>Having trouble with the button?</strong>
          Copy and paste the following link into your browser:
        </p>

        <p style="font-size:13px;word-break:break-all;background:#f8fafc;padding:12px;border-radius:6px;">
          <a href="${link}" style="color:#1F6F5C;">
            ${link}
          </a>
        </p>

        <p>
          <strong>Security Reminder:</strong> If you did not request a
          password reset, you can safely ignore this email. Your current
          password will remain unchanged. Never share your password
          reset link with anyone.
        </p>

        <p style="margin-top:24px;">
          Thank you for choosing Shah's Store!<br/>
          <strong style="color:#153F35;">Team Shah's Store</strong>
        </p>
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