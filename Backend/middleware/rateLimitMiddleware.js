
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 5, // 5 failed attempts allowed
  skipSuccessfulRequests: true, 
  keyGenerator: (req) => {
    return `${req.ip}_${req.body.username || 'unknown'}`; // Composite key: IP + Username
  },
  message: {
    success: false,
    message: "Too many login attempts. Try again after 3 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;