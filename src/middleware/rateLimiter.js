const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const askRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user?._id || ipKeyGenerator(req.ip)),
  message: { message: "Too many requests, please try again in a minute." },
});

module.exports = { askRateLimiter };
