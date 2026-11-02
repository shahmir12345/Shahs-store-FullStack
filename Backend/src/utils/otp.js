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
    subject: "Verify Your Email Address – Shah's Store",
    html: `
      <div style="text-align:center;">
        <h2 style="color:#153F35;font-size:25px;margin-bottom:12px;">
          Verify Your Email Address
        </h2>

        <p style="font-size:16px;color:#334155;">
          Welcome to Shah's Store!
        </p>
      </div>

      <p>
        Thank you for creating an account with Shah's Store.
        To complete your registration and activate your account,
        please verify your email address using the verification code below.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:24px 16px;margin:24px 0;border-radius:10px;text-align:center;">
        <p style="color:#64748b;font-size:14px;margin:0 0 12px;">
          YOUR VERIFICATION CODE
        </p>

        <p style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#153F35;margin:0;">
          ${otp}
        </p>

        <p style="color:#64748b;font-size:13px;margin:14px 0 0;">
          Enter this code on the verification page to continue.
        </p>
      </div>

      <div style="background:#fff7ed;border-left:4px solid #E2982F;padding:14px 16px;margin:24px 0;border-radius:6px;">
        <strong style="color:#9a5b0a;">Important: Code Expiry</strong>

        <p style="margin:6px 0 0;color:#7c5a32;">
          This verification code is valid for <strong>10 minutes</strong>
          only. Please complete your verification before it expires.
        </p>
      </div>

      <p>
        <strong>Security Reminder:</strong> Never share this verification
        code with anyone. Shah's Store will never ask you to disclose
        your OTP through a call, message, or any other channel.
      </p>

      <p>
        If you did not create an account with Shah's Store, you can
        safely ignore this email. No further action is required.
      </p>

      <p style="margin-top:24px;">
        Thank you for choosing Shah's Store!<br/>
        <strong style="color:#153F35;">Team Shah's Store</strong>
      </p>
    `,
  });

};

const checkOtp = (user, otp) => {
  const given = Buffer.from(hashOtp(String(otp)));
  const saved = Buffer.from(user.otpHash);
  return given.length === saved.length && crypto.timingSafeEqual(given, saved);
};

module.exports = { issueOtp, checkOtp, secondsUntilResend, MAX_ATTEMPTS };