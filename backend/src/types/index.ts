// User Types
export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  password: string;
  mobile_number: string;
  email?: string;
  auctions: string[];
  wallet_balance: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface IUserResponse extends Omit<IUser, "password"> {
  id: string;
}

// Admin Types
export interface IAdmin {
  _id?: string;
  id?: string;
  name: string;
  username: string;
  password: string;
  mobile_number: string;
  role: "admin";
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IAdminResponse extends Omit<IAdmin, "password"> {
  id: string;
}

// Auction Types
export interface IAuction {
  _id?: string;
  id: string;
  name: string;
  product_ids: string[];
  valid_until: string; // ISO date string
  registrations: string[]; // user IDs
  created_by: string; // admin ID
  time_created?: Date;
  settled: boolean;
  settled_at?: Date;
}

// Product Types
export interface IProduct {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  auction_id?: string;
  status: "unsold" | "sold";
  sold_to?: string; // user ID
  admin_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Bid Types
export interface IBid {
  _id?: string;
  id?: string;
  product_id: string;
  user_id: string;
  username: string;
  bid_amount: number;
  timestamp: Date;
  is_highest: boolean;
}

export interface IBidPlacementRequest {
  product_name: string;
  bid_amount: number;
  user_id: string;
}

// Transaction Types
export interface ITransaction {
  _id?: string;
  username: string;
  type: "topup" | "bid_placed" | "bid_refunded" | "auction_won" | "auction_lost";
  amount: number;
  timestamp: Date;
  meta?: {
    notes?: string;
    bid_id?: string;
    product_id?: string;
    auction_id?: string;
  };
}

// JWT Payload
export interface IJWTPayload {
  user_id: string;
  username: string;
  role?: "user" | "admin";
  exp?: number;
  iat?: number;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
}

// Auth Request/Response
export interface IRegisterRequest {
  name: string;
  username: string;
  password: string;
  mobile_number: string;
  email?: string;
}

export interface ILoginRequest {
  username: string;
  password: string;
  role?: "user" | "admin";
}

export interface ILoginResponse {
  message: string;
  token: string;
  user: IUserResponse | IAdminResponse;
}

export interface IChangePasswordRequest {
  username: string;
  password: string;
  new_password: string;
  role?: "user" | "admin";
}

// Wallet Types
export interface IWallet {
  username: string;
  balance: number;
}

export interface IWalletTopupRequest {
  amount: number;
}

export interface IBidTransactionContext {
  productId: string;
  userId: string;
  username: string;
  bidAmount: number;
  timestamp: Date;
}
