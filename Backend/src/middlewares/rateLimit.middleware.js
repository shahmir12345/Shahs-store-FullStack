const rateLimit = require("express-rate-limit");

const make = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

exports.authLimiter = make(
  15,
  20,
  "Too many attempts. Please try again in a few minutes."
);

exports.otpLimiter = make(
  15,
  10,
  "Too many code requests. Please try again later."
);

exports.uploadLimiter = make(
  15,
  60,
  "Too many uploads. Please slow down."
);