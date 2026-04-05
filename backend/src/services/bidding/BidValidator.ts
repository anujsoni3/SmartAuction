import { getDatabase } from "../../config/database";
import { Product } from "../../models/Product";
import { Bid } from "../../models/Bid";
import { BidError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { IBidPlacementRequest } from "../../types";

export class BidValidator {
  private productModel: Product;
  private bidModel: Bid;

  constructor() {
    const db = getDatabase();
    this.productModel = new Product(db);
    this.bidModel = new Bid(db);
  }

  // Validate bid placement request
  async validateBidPlacement(bidData: IBidPlacementRequest): Promise<void> {
    // Validate bid amount
    if (!bidData.bid_amount || bidData.bid_amount <= 0) {
      throw new BidError("Bid amount must be greater than 0", "INVALID_BID_AMOUNT");
    }

    // Validate product exists
    const product = await this.productModel.getProductById(bidData.product_name);
    if (!product) {
      throw new BidError("Product not found", "PRODUCT_NOT_FOUND");
    }

    // Validate product is not already sold
    if (product.status === "sold") {
      throw new BidError("Product has already been sold", "BID_PLACEMENT_FAILED");
    }

    // Validate product has valid auction
    if (!product.auction_id) {
      throw new BidError("Product does not belong to any active auction", "AUCTION_NOT_FOUND");
    }
  }

  // Validate bid exceeds minimum (highest existing bid)
  async validateBidAmount(productId: string, bidAmount: number): Promise<void> {
    const highestBid = await this.bidModel.getHighestBid(productId);
    if (highestBid && bidAmount <= highestBid.bid_amount) {
      throw new BidError(`Bid amount must be greater than the highest bid (₹${highestBid.bid_amount})`, "BID_TOO_LOW");
    }
  }

  // Validate auction is still active
  async validateAuctionActive(productId: string): Promise<void> {
    const product = await this.productModel.getProductById(productId);
    if (!product || !product.auction_id) {
      throw new BidError("Product auction not found", "AUCTION_NOT_FOUND");
    }

    // Check if auction end time has passed
    // This will be checked in the actual service layer with Auction model
  }

  // Validate wallet has sufficient balance
  validateWalletBalance(balance: number, bidAmount: number): void {
    if (balance < bidAmount) {
      throw new BidError(
        `Insufficient wallet balance. Current: ₹${balance}, Required: ₹${bidAmount}`,
        "INSUFFICIENT_BALANCE"
      );
    }
  }
}
