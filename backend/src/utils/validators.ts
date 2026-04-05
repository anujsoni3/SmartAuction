import Joi from "joi";
import { ValidationError } from "./errors";
import { IRegisterRequest, ILoginRequest, IChangePasswordRequest, IWalletTopupRequest, IBidPlacementRequest } from "../types";

// Validation Schemas
export const validationSchemas = {
  // Auth Schemas
  register: Joi.object<IRegisterRequest>({
    name: Joi.string().required().min(2).max(100),
    username: Joi.string().required().min(3).max(50).alphanum(),
    password: Joi.string().required().min(6).max(100),
    mobile_number: Joi.string().required().regex(/^\d{10}$/),
    email: Joi.string().email().optional(),
  }),

  login: Joi.object<ILoginRequest>({
    username: Joi.string().required().min(3).max(50),
    password: Joi.string().required().min(6),
    role: Joi.string().valid("user", "admin").optional(),
  }),

  changePassword: Joi.object<IChangePasswordRequest>({
    username: Joi.string().required(),
    password: Joi.string().required().min(6),
    new_password: Joi.string().required().min(6),
    role: Joi.string().valid("user", "admin").optional(),
  }),

  // Wallet Schemas
  topup: Joi.object<IWalletTopupRequest>({
    amount: Joi.number().required().positive().min(1),
  }),

  // Bid Schemas
  placeBid: Joi.object<IBidPlacementRequest>({
    product_name: Joi.string().required().min(1),
    bid_amount: Joi.number().required().positive().min(1),
    user_id: Joi.string().required(),
  }),

  // Auction Schemas
  createAuction: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required().min(3).max(200),
    product_ids: Joi.array().items(Joi.string()).required(),
    valid_until: Joi.string().required().isoDate(),
  }),

  // Product Schemas
  createProduct: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required().min(3).max(200),
    description: Joi.string().max(1000).optional(),
    auction_id: Joi.string().optional(),
  }),
};

export function validate<T>(data: any, schema: Joi.ObjectSchema<T>): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors: Record<string, string[]> = {};
    error.details.forEach((detail) => {
      const key = detail.context?.key || detail.path.join(".");
      if (!errors[key]) {
        errors[key] = [];
      }
      errors[key].push(detail.message);
    });
    throw new ValidationError("Validation failed", errors);
  }

  return value as T;
}

// Helper validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

export function validateBidAmount(amount: number): boolean {
  return typeof amount === "number" && amount > 0 && isFinite(amount);
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6 && password.length <= 100;
}
