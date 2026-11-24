import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// Rate limiter for complaint submission
export const submissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 complaints per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Submission rate limit reached. Please wait a few minutes before submitting another complaint.'
  }
});

// Rate limiter for public tracking lookup
export const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Tracking lookup limit reached. Please wait a moment.'
  }
});
