import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // Limit each IP to 100 requests per windowMs (10000 in tests)
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') ? 10000 : 5, // Limit each IP to 5 requests per windowMs in production (10000 in dev/test)
  message: {
    success: false,
    error: 'Too many login or registration attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
