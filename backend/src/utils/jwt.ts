import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { IJWTPayload } from "../types";
import { AuthenticationError } from "./errors";
import { logger } from "./logger";

export function generateToken(payload: Omit<IJWTPayload, "exp" | "iat">): string {
  try {
    const options: SignOptions = {
      expiresIn: "10h", // Use string format directly
      algorithm: "HS256",
    };
    const token = jwt.sign(payload, env.SECRET_KEY, options);
    return token;
  } catch (error) {
    logger.error(`Token generation failed: ${error}`);
    throw new AuthenticationError("Failed to generate authentication token");
  }
}

export function verifyToken(token: string): IJWTPayload {
  try {
    const decoded = jwt.verify(token, env.SECRET_KEY, {
      algorithms: ["HS256"],
    }) as IJWTPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AuthenticationError("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new AuthenticationError("Invalid token");
    }
    throw new AuthenticationError("Token verification failed");
  }
}

export function extractToken(authHeader?: string): string {
  if (!authHeader) {
    throw new AuthenticationError("Authorization header missing");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new AuthenticationError("Invalid authorization header format");
  }

  return parts[1];
}

export function extractTokenFromQuery(token?: string): string {
  if (!token) {
    throw new AuthenticationError("Token query parameter missing");
  }
  return token;
}
