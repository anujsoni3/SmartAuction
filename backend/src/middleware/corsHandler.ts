import cors from "cors";
import { env } from "../config/env";

export function corsHandler() {
  return cors({
    origin: env.CORS_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
  });
}

export default corsHandler;
