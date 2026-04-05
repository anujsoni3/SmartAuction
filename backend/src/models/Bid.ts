import { Db } from "mongodb";
import { BaseModel } from "./BaseModel";
import { IBid } from "../types";
import { COLLECTIONS } from "../config/constants";

export class Bid extends BaseModel {
  constructor(db: Db) {
    super(db, COLLECTIONS.BIDS);
  }

  // Create new bid
  async createBid(bidData: IBid): Promise<string> {
    const result = await this.insertOne(bidData);
    return result.insertedId.toString();
  }

  // Get bid by ID
  async getBidById(bidId: string): Promise<IBid | null> {
    return (await this.findOne({ id: bidId })) as IBid | null;
  }

  // Get all bids for a product
  async getBidsForProduct(productId: string, limit: number = 100, skip: number = 0): Promise<IBid[]> {
    return (await this.find({ product_id: productId }, limit, skip)) as IBid[];
  }

  // Get highest bid for a product
  async getHighestBid(productId: string): Promise<IBid | null> {
    const bids = (await this.find({ product_id: productId })) as IBid[];
    if (bids.length === 0) {
      return null;
    }
    // Find highest bid
    let highest = bids[0];
    for (const bid of bids) {
      if (bid.bid_amount > highest.bid_amount) {
        highest = bid;
      }
    }
    return highest;
  }

  // Get bids by user
  async getBidsByUser(userId: string, limit: number = 100): Promise<IBid[]> {
    return (await this.find({ user_id: userId })) as IBid[];
  }

  // Get bids by username
  async getBidsByUsername(username: string): Promise<IBid[]> {
    return (await this.find({ username })) as IBid[];
  }

  // Check if user has bid on product
  async userHasBid(productId: string, userId: string): Promise<boolean> {
    return await this.exists({ product_id: productId, user_id: userId });
  }

  // Update bid (mark as highest, etc.)
  async updateBid(bidId: string, updates: Partial<IBid>): Promise<void> {
    await this.updateOne({ id: bidId }, { $set: updates });
  }

  // Count bids for a product
  async countBidsForProduct(productId: string): Promise<number> {
    return await this.countDocuments({ product_id: productId });
  }

  // Unset highest flag for other bids of same product
  async unsetHighestBidFlag(productId: string): Promise<void> {
    await this.updateMany({ product_id: productId, is_highest: true }, { $set: { is_highest: false } });
  }

  // Mark bid as highest
  async markAsHighest(bidId: string, productId: string): Promise<void> {
    // First, unset highest flag for other bids
    await this.unsetHighestBidFlag(productId);
    // Then set this bid as highest
    await this.updateOne({ id: bidId }, { $set: { is_highest: true } });
  }

  // Delete bid (for rollback)
  async deleteBid(bidId: string): Promise<void> {
    await this.deleteOne({ id: bidId });
  }

  // Get recent bids (for real-time updates)
  async getRecentBids(productId: string, limit: number = 5): Promise<IBid[]> {
    const pipeline = [
      { $match: { product_id: productId } },
      { $sort: { timestamp: -1 } },
      { $limit: limit },
    ];
    const results = await this.aggregate(pipeline);
    return results as IBid[];
  }
}
