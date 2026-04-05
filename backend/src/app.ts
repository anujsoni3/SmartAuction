import express, { Express, Request, Response, NextFunction } from "express";
import { corsHandler } from "./middleware/corsHandler";
import { morganMiddleware, requestLogger } from "./middleware/logger";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { logger } from "./utils/logger";
import { HTTP_STATUS } from "./config/constants";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import auctionRoutes from "./routes/auction";
import adminRoutes from "./routes/admin";
import walletRoutes from "./routes/wallet";

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(requestLogger);
  app.use(morganMiddleware);
  app.use(corsHandler());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use(generalLimiter);

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // API Documentation endpoint
  app.get("/", (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "SmartAuction API v1.0",
      documentation: {
        base_url: `http://localhost:${process.env.PORT || 5000}/api`,
        version: "1.0.0",
        endpoints: {
          auth: {
            register: "POST /api/register",
            login: "POST /api/login",
            change_password: "POST /api/change-password",
            admin_register: "POST /api/admin/register",
            admin_login: "POST /api/admin/login",
            admin_change_password: "POST /api/admin/change-password",
          },
          users: {
            list_auctions: "GET /api/auctions",
            auction_products: "GET /api/auctions/:auctionId/products",
            register_auction: "POST /api/auctions/register",
            place_bid: "POST /api/bid",
          },
          admin: {
            create_auction: "POST /api/admin/auction",
            update_auction: "PUT /api/admin/auction/:auctionId",
            list_auctions: "GET /api/admin/auctions",
            create_product: "POST /api/admin/product",
            update_product: "PUT /api/admin/product/:productId",
          },
          wallet: {
            get_wallet: "GET /api/wallet",
            topup: "POST /api/wallet/topup",
            rollback_bid: "POST /api/rollback-bid",
          },
        },
        websocket: {
          url: "ws://localhost:5000",
          events: {
            place_bid: "place-bid",
            bid_placed: "bid-placed",
            auction_status: "auction-status",
          },
        },
      },
    });
  });

  // Register routes
  app.use("/api", authRoutes);
  app.use("/api", userRoutes);
  app.use("/api", auctionRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", walletRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Endpoint not found",
      code: "NOT_FOUND",
      path: req.path,
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;
