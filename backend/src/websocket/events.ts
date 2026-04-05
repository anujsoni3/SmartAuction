// WebSocket Event Constants
export const WS_EVENTS = {
  // Client → Server
  JOIN_AUCTION: "join-auction",
  LEAVE_AUCTION: "leave-auction",
  PLACE_BID: "place-bid",
  
  // Server → Client
  BID_PLACED: "bid-placed",
  BID_ERROR: "bid-error",
  AUCTION_UPDATE: "auction-update",
  HIGHEST_BID_UPDATED: "highest-bid-updated",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  ERROR: "error",
  NOTIFICATION: "notification",
};

// Room naming conventions
export function getAuctionRoom(auctionId: string): string {
  return `auction:${auctionId}`;
}

export function getProductRoom(productId: string): string {
  return `product:${productId}`;
}
