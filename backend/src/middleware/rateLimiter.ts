import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants";

// General rate limiter for all requests
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Too many requests, please try again later",
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  },
});

// Auth endpoints rate limiter (stricter limits)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later",
  skip: (req) => {
    // Skip rate limiting for GET requests
    return req.method === "GET";
  },
  handler: (req, res) => {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Too many authentication attempts, please try again later",
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  },
});

// Bid endpoints rate limiter
export const bidLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each user to 20 bids per minute
  keyGenerator: (req) => {
    // Use user_id from token if available, otherwise use IP
    return (req as any).user?.user_id || req.ip || "unknown";
  },
  handler: (req, res) => {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Too many bid attempts, please slow down",
      code: ERROR_CODES.BID_PLACEMENT_FAILED,
    });
  },
});

export default {
  generalLimiter,
  authLimiter,
  bidLimiter,
};
