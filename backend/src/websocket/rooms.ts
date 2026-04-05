import { Socket, Server } from "socket.io";
import { logger } from "../utils/logger";

/**
 * Room management for Socket.io
 * Handles user joins/leaves for auction rooms
 */
export class RoomManager {
  private io: Server;
  private userRooms: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Add socket to an auction room
   */
  joinAuctionRoom(socket: Socket, auctionId: string): void {
    const roomName = `auction:${auctionId}`;
    socket.join(roomName);

    // Track user in room
    if (!this.userRooms.has(roomName)) {
      this.userRooms.set(roomName, new Set());
    }
    this.userRooms.get(roomName)!.add(socket.id);

    logger.info(`✅ Socket ${socket.id} joined room ${roomName}`);

    // Broadcast user joined
    this.io.to(roomName).emit("user-joined", {
      userId: socket.data.userId,
      username: socket.data.username,
      totalUsers: this.userRooms.get(roomName)!.size,
    });
  }

  /**
   * Remove socket from an auction room
   */
  leaveAuctionRoom(socket: Socket, auctionId: string): void {
    const roomName = `auction:${auctionId}`;
    socket.leave(roomName);

    // Update tracking
    const users = this.userRooms.get(roomName);
    if (users) {
      users.delete(socket.id);
      if (users.size === 0) {
        this.userRooms.delete(roomName);
      } else {
        // Broadcast user left
        this.io.to(roomName).emit("user-left", {
          userId: socket.data.userId,
          username: socket.data.username,
          totalUsers: users.size,
        });
      }
    }

    logger.info(`❌ Socket ${socket.id} left room ${roomName}`);
  }

  /**
   * Broadcast to auction room
   */
  broadcastToAuction(auctionId: string, event: string, data: any): void {
    const roomName = `auction:${auctionId}`;
    this.io.to(roomName).emit(event, data);
    logger.info(`📡 Broadcast to ${roomName}: ${event}`);
  }

  /**
   * Get number of users in a room
   */
  getRoomUserCount(auctionId: string): number {
    const roomName = `auction:${auctionId}`;
    const users = this.userRooms.get(roomName);
    return users ? users.size : 0;
  }

  /**
   * Check if room exists
   */
  roomExists(auctionId: string): boolean {
    const roomName = `auction:${auctionId}`;
    return this.userRooms.has(roomName);
  }
}
