const crypto = require("crypto");
const sendEmail = require("./sendEmail");

const OTP_TTL_MS = 10 * 60 * 1000;   //10 minutes tak otp valid
const RESEND_GAP_MS = 60 * 1000;     //60 seconds ke baad resend OTP
const MAX_ATTEMPTS = 5;           

const hashOtp = (otp) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(otp).digest("hex");

const secondsUntilResend = (user) => {
  if (!user.otpSentAt) return 0;
  const wait = RESEND_GAP_MS - (Date.now() - user.otpSentAt.getTime());
  return wait > 0 ? Math.ceil(wait / 1000) : 0;
};

const issueOtp = async (user) => {
  const otp = String(crypto.randomInt(100000, 1000000));

  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.otpAttempts = 0;
  user.otpSentAt = new Date();
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Your Shah's Store verification code",
    html: `
      <h2>Verify your email</h2>
      <p>Your code is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:6px">${otp}</p>
      <p>It expires in 10 minutes. If you did not sign up, ignore this email.</p>
    `,
  });
};

const checkOtp = (user, otp) => {
  const given = Buffer.from(hashOtp(String(otp)));
  const saved = Buffer.from(user.otpHash);
  return given.length === saved.length && crypto.timingSafeEqual(given, saved);
};

module.exports = { issueOtp, checkOtp, secondsUntilResend, MAX_ATTEMPTS };