import { Db } from "mongodb";
import { BaseModel } from "./BaseModel";
import { IAuction } from "../types";
import { COLLECTIONS } from "../config/constants";

export class Auction extends BaseModel {
  constructor(db: Db) {
    super(db, COLLECTIONS.AUCTIONS);
  }

  // Create new auction
  async createAuction(auctionData: IAuction): Promise<string> {
    const auction = {
      ...auctionData,
      registrations: auctionData.registrations || [],
      settled: false,
      time_created: new Date(),
    };
    const result = await this.insertOne(auction);
    return result.insertedId.toString();
  }

  // Get auction by ID
  async getAuctionById(auctionId: string): Promise<IAuction | null> {
    return (await this.findOne({ id: auctionId })) as IAuction | null;
  }

  // List all valid (non-expired) auctions
  async listValidAuctions(): Promise<IAuction[]> {
    const now = new Date().toISOString();
    return (await this.find({ valid_until: { $gt: now } })) as IAuction[];
  }

  // List all auctions
  async listAuctions(limit: number = 100, skip: number = 0): Promise<IAuction[]> {
    return (await this.find({}, limit, skip)) as IAuction[];
  }

  // Update auction
  async updateAuction(auctionId: string, updates: Partial<IAuction>): Promise<void> {
    await this.updateOne({ id: auctionId }, { $set: updates });
  }

  // Add user to auction registrations
  async addRegistration(auctionId: string, userId: string): Promise<void> {
    await this.updateOne({ id: auctionId }, { $addToSet: { registrations: userId } });
  }

  // Check if user is registered for auction
  async isUserRegistered(auctionId: string, userId: string): Promise<boolean> {
    const auction = await this.findOne({ id: auctionId, registrations: userId });
    return auction !== null;
  }

  // Get auction by product ID
  async getAuctionByProductId(productId: string): Promise<IAuction | null> {
    return (await this.findOne({ product_ids: { $in: [productId] } })) as IAuction | null;
  }

  // Check if auction is still active
  async isAuctionActive(auctionId: string): Promise<boolean> {
    const now = new Date().toISOString();
    const auction = await this.findOne({ id: auctionId, valid_until: { $gt: now }, settled: false });
    return auction !== null;
  }

  // Settle auction
  async settleAuction(auctionId: string): Promise<void> {
    await this.updateOne({ id: auctionId }, { $set: { settled: true, settled_at: new Date() } });
  }
}
