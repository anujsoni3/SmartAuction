import { Socket } from "socket.io";
import { BidService } from "../../services/bidding/BidService";
import { WalletService } from "../../services/wallet/WalletService";
import { logger } from "../../utils/logger";
import { WS_EVENTS } from "../events";

interface BidPlacementPayload {
  product_name: string;
  bid_amount: number;
}

/**
 * Handle bid placement via WebSocket
 * Integrates with BidService for atomic operations
 */
export async function handleBidPlacement(
  socket: Socket,
  payload: BidPlacementPayload,
  socket_io: any
): Promise<void> {
  try {
    logger.info(`[WS BID] User ${socket.data.username} trying to place bid: ${JSON.stringify(payload)}`);

    const bidService = new BidService();
    const walletService = new WalletService();

    // Place bid using BidService (handles all atomic operations)
    const result = await bidService.placeBid({
      product_name: payload.product_name,
      bid_amount: payload.bid_amount,
      user_id: socket.data.userId,
    });

    logger.info(`✅ [WS BID] Bid placed successfully: bidId=${result.bidId}`);

    // Send success to bidder
    socket.emit(WS_EVENTS.BID_PLACED, {
      success: true,
      message: result.message,
      bid_id: result.bidId,
      bid_amount: payload.bid_amount,
      timestamp: new Date(),
    });

    // Broadcast to all users in the product/auction room (optional - if auctionId is available)
    // For now, broadcast globally (can be improved with room management)
    socket.broadcast.emit(WS_EVENTS.BID_PLACED, {
      success: true,
      message: `${socket.data.username} placed a bid of ₹${payload.bid_amount}`,
      product_name: payload.product_name,
      bid_amount: payload.bid_amount,
      bid_by: socket.data.username,
      timestamp: new Date(),
    });

    // Get updated wallet balance and send
    const newBalance = await walletService.getWalletBalance(socket.data.username);
    socket.emit("wallet-updated", {
      new_balance: newBalance,
    });
  } catch (error: any) {
    logger.error(`❌ [WS BID] Bid placement failed: ${error.message}`);

    socket.emit(WS_EVENTS.BID_ERROR, {
      success: false,
      message: error.message,
      code: error.code || "BID_PLACEMENT_FAILED",
    });
  }
}

/**
 * Handle auction join event
 */
export function handleAuctionJoin(
  socket: Socket,
  auctionId: string,
  roomManager: any
): void {
  try {
    logger.info(`[WS] User ${socket.data.username} joining auction ${auctionId}`);

    // Join room
    roomManager.joinAuctionRoom(socket, auctionId);

    // Send confirmation to user
    socket.emit(WS_EVENTS.AUCTION_UPDATE, {
      action: "joined",
      auctionId,
      message: "Connected to auction",
      activeUsers: roomManager.getRoomUserCount(auctionId),
    });
  } catch (error) {
    logger.error(`❌ [WS] Failed to join auction: ${error}`);
    socket.emit(WS_EVENTS.ERROR, {
      message: "Failed to join auction",
    });
  }
}

/**
 * Handle auction leave event
 */
export function handleAuctionLeave(
  socket: Socket,
  auctionId: string,
  roomManager: any
): void {
  try {
    logger.info(`[WS] User ${socket.data.username} leaving auction ${auctionId}`);

    // Leave room
    roomManager.leaveAuctionRoom(socket, auctionId);

    // Send confirmation
    socket.emit(WS_EVENTS.AUCTION_UPDATE, {
      action: "left",
      auctionId,
      message: "Left auction",
    });
  } catch (error) {
    logger.error(`❌ [WS] Failed to leave auction: ${error}`);
  }
}
