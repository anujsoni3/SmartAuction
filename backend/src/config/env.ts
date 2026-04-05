import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/smartauction",
  DB_NAME: process.env.DB_NAME || "smartauction",
  
  // JWT
  SECRET_KEY: process.env.SECRET_KEY || "your_secret_key_change_in_production",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "10h",
  
  // API Keys
  API_KEY: process.env.API_KEY || "",
  
  // CORS
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:5173,https://smart-auction-1213.vercel.app").split(","),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};

// Validate critical environment variables
const requiredEnvVars = ["MONGO_URI", "SECRET_KEY"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

export default env;
