import { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../utils/jwt";
import { AuthenticationError } from "../utils/errors";
import { IJWTPayload } from "../types";

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        message: error.message,
        code: error.code,
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: "Authentication failed",
      code: "INVALID_TOKEN",
    });
  }
}

export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = extractToken(authHeader);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }
  next();
}

export function requireRole(role: "user" | "admin") {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "UNAUTHORIZED_ACCESS",
      });
      return;
    }

    if (req.user.role && req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: "Access denied",
        code: "UNAUTHORIZED_ACCESS",
      });
      return;
    }

    next();
  };
}
