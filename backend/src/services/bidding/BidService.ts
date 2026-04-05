import { getDatabase } from "../../config/database";
import { User } from "../../models/User";
import { Auction } from "../../models/Auction";
import { Product } from "../../models/Product";
import { Bid } from "../../models/Bid";
import { BidValidator } from "./BidValidator";
import { BidTransactionManager } from "./BidTransactionManager";
import { NotFoundError, BidError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { IBidPlacementRequest, IBid } from "../../types";

export class BidService {
  private userModel: User;
  private auctionModel: Auction;
  private productModel: Product;
  private bidModel: Bid;
  private bidValidator: BidValidator;
  private bidTransactionManager: BidTransactionManager;

  constructor() {
    const db = getDatabase();
    this.userModel = new User(db);
    this.auctionModel = new Auction(db);
    this.productModel = new Product(db);
    this.bidModel = new Bid(db);
    this.bidValidator = new BidValidator();
    this.bidTransactionManager = new BidTransactionManager();
  }

  /**
   * Place a bid on a product
   * Uses atomic transaction for data consistency
   */
  async placeBid(bidData: IBidPlacementRequest): Promise<{ bidId: string; message: string }> {
    // Validate bid placement request
    await this.bidValidator.validateBidPlacement(bidData);

    // Get user details
    const user = await this.userModel.getUserById(bidData.user_id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get product details
    const product = await this.productModel.getProductById(bidData.product_name);
    if (!product) {
      throw new BidError("Product not found", "PRODUCT_NOT_FOUND");
    }

    // Verify auction is still active
    if (!product.auction_id) {
      throw new BidError("Product does not have an active auction", "AUCTION_NOT_FOUND");
    }

    const auction = await this.auctionModel.getAuctionById(product.auction_id);
    if (!auction) {
      throw new BidError("Auction not found", "AUCTION_NOT_FOUND");
    }

    // Check if auction is expired
    const now = new Date();
    const auctionEnd = new Date(auction.valid_until);
    if (now > auctionEnd) {
      throw new BidError("Auction has ended", "AUCTION_EXPIRED");
    }

    // Validate bid amount
    await this.bidValidator.validateBidAmount(bidData.product_name, bidData.bid_amount);

    // Validate wallet balance
    this.bidValidator.validateWalletBalance(user.wallet_balance, bidData.bid_amount);

    // Execute atomic bid transaction
    const result = await this.bidTransactionManager.placeBid({
      productId: bidData.product_name,
      userId: bidData.user_id,
      username: user.username,
      bidAmount: bidData.bid_amount,
      timestamp: new Date(),
    });

    logger.info(`✅ Bid placed: user=${user.username}, product=${bidData.product_name}, amount=₹${bidData.bid_amount}`);

    return result;
  }

  /**
   * Get highest bid for a product
   */
  async getHighestBid(productId: string): Promise<IBid | null> {
    return await this.bidModel.getHighestBid(productId);
  }

  /**
   * Get all bids for a product
   */
  async getBidsForProduct(productId: string, limit: number = 100): Promise<IBid[]> {
    return await this.bidModel.getBidsForProduct(productId, limit);
  }

  /**
   * Get bids by user
   */
  async getBidsByUser(userId: string): Promise<IBid[]> {
    return await this.bidModel.getBidsByUser(userId);
  }

  /**
   * Get bid history
   */
  async getBidHistory(productId: string, limit: number = 5): Promise<IBid[]> {
    return await this.bidModel.getRecentBids(productId, limit);
  }

  /**
   * Count bids for a product
   */
  async countBidsForProduct(productId: string): Promise<number> {
    return await this.bidModel.countBidsForProduct(productId);
  }
}
