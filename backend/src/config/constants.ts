// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Codes
export const ERROR_CODES = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  AUCTION_NOT_FOUND: "AUCTION_NOT_FOUND",
  AUCTION_EXPIRED: "AUCTION_EXPIRED",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  BID_TOO_LOW: "BID_TOO_LOW",
  INVALID_BID_AMOUNT: "INVALID_BID_AMOUNT",
  BID_PLACEMENT_FAILED: "BID_PLACEMENT_FAILED",
  WALLET_TOPUP_FAILED: "WALLET_TOPUP_FAILED",
  DATABASE_ERROR: "DATABASE_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
};

// Auction Status
export const AUCTION_STATUS = {
  UPCOMING: "upcoming",
  LIVE: "live",
  EXPIRED: "expired",
  SETTLED: "settled",
};

// Wallet Transaction Types
export const TRANSACTION_TYPE = {
  TOPUP: "topup",
  BID_PLACED: "bid_placed",
  BID_REFUNDED: "bid_refunded",
  AUCTION_WON: "auction_won",
  AUCTION_LOST: "auction_lost",
};

// Collection Names
export const COLLECTIONS = {
  USERS: "users",
  ADMINS: "admins",
  PRODUCTS: "products",
  AUCTIONS: "auctions",
  BIDS: "bids",
  TRANSACTIONS: "transactions",
};

// WebSocket Events
export const WS_EVENTS = {
  // Client → Server
  PLACE_BID: "place-bid",
  AUCTION_JOIN: "auction-join",
  AUCTION_LEAVE: "auction-leave",
  
  // Server → Client
  BID_PLACED: "bid-placed",
  BID_ERROR: "bid-error",
  HIGHEST_BID_UPDATED: "highest-bid-updated",
  AUCTION_STATUS: "auction-status",
  AUCTION_ENDED: "auction-ended",
  ERROR: "error",
  NOTIFICATION: "notification",
};

// Default Values
export const DEFAULTS = {
  INITIAL_WALLET_BALANCE: 500,
  JWT_EXPIRY_SECONDS: 10 * 60 * 60, // 10 hours
  BID_HISTORY_LIMIT: 100,
};
