import { getDatabase } from "../../config/database";
import { User } from "../../models/User";
import { Auction } from "../../models/Auction";
import { NotFoundError } from "../../utils/errors";
import { logger } from "../../utils/logger";

export class UserService {
  private userModel: User;
  private auctionModel: Auction;

  constructor() {
    const db = getDatabase();
    this.userModel = new User(db);
    this.auctionModel = new Auction(db);
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<any> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      mobile_number: user.mobile_number,
      email: user.email,
      wallet_balance: user.wallet_balance,
      total_auctions: user.auctions.length,
    };
  }

  /**
   * List all active auctions
   */
  async listActiveAuctions(): Promise<any[]> {
    const auctions = await this.auctionModel.listValidAuctions();
    return auctions.map((auction) => ({
      id: auction.id,
      name: auction.name,
      valid_until: auction.valid_until,
      total_products: auction.product_ids.length,
      registered_users: auction.registrations.length,
    }));
  }

  /**
   * Register user for an auction
   */
  async registerForAuction(userId: string, auctionId: string): Promise<{ message: string }> {
    // Check if auction exists and is valid
    const auction = await this.auctionModel.getAuctionById(auctionId);
    if (!auction) {
      throw new NotFoundError("Auction not found");
    }

    // Check if auction is still valid
    const now = new Date();
    const auctionEnd = new Date(auction.valid_until);
    if (now > auctionEnd) {
      throw new NotFoundError("Auction has expired");
    }

    // Check if user is already registered
    const isRegistered = await this.auctionModel.isUserRegistered(auctionId, userId);
    if (isRegistered) {
      return { message: "User already registered for this auction" };
    }

    // Add registration
    await this.auctionModel.addRegistration(auctionId, userId);
    await this.userModel.addAuction(userId, auctionId);

    logger.info(`✅ User ${userId} registered for auction ${auctionId}`);

    return { message: "Successfully registered for auction" };
  }

  /**
   * Get user's registered auctions
   */
  async getUserAuctions(userId: string): Promise<any[]> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const auctions = await Promise.all(
      user.auctions.map((auctionId) => this.auctionModel.getAuctionById(auctionId))
    );

    return auctions
      .filter((auction) => auction !== null)
      .map((auction) => ({
        id: auction!.id,
        name: auction!.name,
        valid_until: auction!.valid_until,
        total_products: auction!.product_ids.length,
      }));
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(userId: string): Promise<number> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user.wallet_balance;
  }
}
