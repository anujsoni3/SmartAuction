import http from "http";
import { Server as SocketIOServer } from "socket.io";
import createApp from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { logger } from "./utils/logger";
import { socketAuthMiddleware } from "./websocket/middleware/socketAuth";
import { RoomManager } from "./websocket/rooms";
import {
  handleBidPlacement,
  handleAuctionJoin,
  handleAuctionLeave,
} from "./websocket/handlers/bidHandler";
import { broadcastAuctionStatus } from "./websocket/handlers/auctionHandler";

async function startServer(): Promise<void> {
  try {
    // Connect to database
    logger.info("🔗 Connecting to MongoDB...");
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Setup Socket.io
    const io = new SocketIOServer(server, {
      cors: {
        origin: env.CORS_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Store io instance for use in routes (optional - can be improved with dependency injection)
    (app as any).io = io;

    // Initialize room manager
    const roomManager = new RoomManager(io);

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    // Socket.io connection handler
    io.on("connection", (socket) => {
      logger.info(`✅ WebSocket client connected: ${socket.id} (user: ${socket.data.username})`);

      // ========== EVENT HANDLERS ==========

      // Join auction room
      socket.on("join-auction", (data) => {
        handleAuctionJoin(socket, data.auctionId, roomManager);
      });

      // Leave auction room
      socket.on("leave-auction", (data) => {
        handleAuctionLeave(socket, data.auctionId, roomManager);
      });

      // Place bid via WebSocket
      socket.on("place-bid", async (data) => {
        await handleBidPlacement(socket, data, io);
        // Broadcast updated auction status to room
        if (data.auctionId) {
          await broadcastAuctionStatus(io, data.auctionId, data.product_name);
        }
      });

      // Disconnect handler
      socket.on("disconnect", () => {
        logger.info(`❌ WebSocket client disconnected: ${socket.id}`);
      });

      // Error handler
      socket.on("error", (error) => {
        logger.error(`❌ WebSocket error: ${error}`);
      });
    });

    // Start server
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`📡 WebSocket server on ws://localhost:${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📦 Database: ${env.DB_NAME}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("📌 SIGTERM received, shutting down gracefully...");
      server.close(async () => {
        logger.info("✅ HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.info("📌 SIGINT received, shutting down gracefully...");
      server.close(async () => {
        logger.info("✅ HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error(`💥 Uncaught Exception: ${error.message}`, {
        stack: error.stack,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      logger.error(`💥 Unhandled Rejection at ${promise}: ${reason}`);
    });
  } catch (error) {
    logger.error(`❌ Server startup failed: ${error}`);
    process.exit(1);
  }
}

startServer();
