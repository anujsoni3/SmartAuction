import { Socket } from "socket.io";
import { BidService } from "../../services/bidding/BidService";
import { logger } from "../../utils/logger";
import { WS_EVENTS } from "../events";

/**
 * Broadcast auction status updates
 */
export async function broadcastAuctionStatus(
  socket_io: any,
  auctionId: string,
  productId: string
): Promise<void> {
  try {
    const bidService = new BidService();

    // Get highest bid
    const highestBid = await bidService.getHighestBid(productId);
    const bidCount = await bidService.countBidsForProduct(productId);

    const roomName = `auction:${auctionId}`;
    socket_io.to(roomName).emit(WS_EVENTS.HIGHEST_BID_UPDATED, {
      product_id: productId,
      auction_id: auctionId,
      highest_bid: highestBid ? highestBid.bid_amount : 0,
      bid_by: highestBid ? highestBid.username : null,
      total_bids: bidCount,
      timestamp: new Date(),
    });

    logger.info(`📡 Broadcast auction status for product ${productId}: highest=₹${highestBid?.bid_amount || 0}`);
  } catch (error) {
    logger.error(`❌ Failed to broadcast auction status: ${error}`);
  }
}

/**
 * Send notification to user
 */
export function sendNotification(
  socket: Socket,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
): void {
  socket.emit(WS_EVENTS.NOTIFICATION, {
    title,
    message,
    type,
    timestamp: new Date(),
  });
}

/**
 * Broadcast auction end notification
 */
export function broadcastAuctionEnd(socket_io: any, auctionId: string, message: string): void {
  const roomName = `auction:${auctionId}`;
  socket_io.to(roomName).emit(WS_EVENTS.NOTIFICATION, {
    title: "Auction Ended",
    message,
    type: "info",
    timestamp: new Date(),
  });

  logger.info(`📡 Broadcast auction end: ${auctionId}`);
}
