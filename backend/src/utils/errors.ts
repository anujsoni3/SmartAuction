import { HTTP_STATUS, ERROR_CODES } from "../config/constants";

export class AppError extends Error {
  constructor(
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public message: string = "Internal Server Error",
    public code: string = ERROR_CODES.DATABASE_ERROR,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(HTTP_STATUS.BAD_REQUEST, message, ERROR_CODES.VALIDATION_ERROR, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(HTTP_STATUS.UNAUTHORIZED, message, ERROR_CODES.INVALID_TOKEN);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(HTTP_STATUS.FORBIDDEN, message, ERROR_CODES.UNAUTHORIZED_ACCESS);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(HTTP_STATUS.NOT_FOUND, message, ERROR_CODES.USER_NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(HTTP_STATUS.CONFLICT, message, ERROR_CODES.USER_ALREADY_EXISTS);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, ERROR_CODES.DATABASE_ERROR);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

export class BidError extends AppError {
  constructor(message: string, code: string = ERROR_CODES.BID_PLACEMENT_FAILED) {
    super(HTTP_STATUS.BAD_REQUEST, message, code);
    Object.setPrototypeOf(this, BidError.prototype);
  }
}

export class WalletError extends AppError {
  constructor(message: string, code: string = ERROR_CODES.WALLET_TOPUP_FAILED) {
    super(HTTP_STATUS.BAD_REQUEST, message, code);
    Object.setPrototypeOf(this, WalletError.prototype);
  }
}
