import { Db, ObjectId } from "mongodb";
import { BaseModel } from "./BaseModel";
import { IUser } from "../types";
import { COLLECTIONS, DEFAULTS } from "../config/constants";

export class User extends BaseModel {
  constructor(db: Db) {
    super(db, COLLECTIONS.USERS);
  }

  // Create new user
  async createUser(userData: Omit<IUser, "_id">): Promise<string> {
    const user = {
      ...userData,
      wallet_balance: DEFAULTS.INITIAL_WALLET_BALANCE,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await this.insertOne(user);
    return result.insertedId.toString();
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<IUser | null> {
    return (await this.findOne({ username })) as IUser | null;
  }

  // Get user by ID
  async getUserById(userId: string): Promise<IUser | null> {
    const objectId = new ObjectId(userId);
    return (await this.findOne({ _id: objectId })) as IUser | null;
  }

  // Check if username exists
  async usernameExists(username: string): Promise<boolean> {
    return await this.exists({ username });
  }

  // Update wallet balance
  async updateWalletBalance(userId: string, amount: number): Promise<void> {
    const objectId = new ObjectId(userId);
    await this.updateOne({ _id: objectId }, { $inc: { wallet_balance: amount }, $set: { updated_at: new Date() } });
  }

  // Get wallet balance
  async getWalletBalance(username: string): Promise<number> {
    const user = (await this.findOne({ username })) as IUser | null;
    return user?.wallet_balance || 0;
  }

  // Add auction to user's auctions list
  async addAuction(userId: string, auctionId: string): Promise<void> {
    const objectId = new ObjectId(userId);
    await this.updateOne({ _id: objectId }, { $addToSet: { auctions: auctionId }, $set: { updated_at: new Date() } });
  }

  // Remove auction from user's auctions list
  async removeAuction(userId: string, auctionId: string): Promise<void> {
    const objectId = new ObjectId(userId);
    await this.updateOne({ _id: objectId }, { $pull: { auctions: auctionId }, $set: { updated_at: new Date() } });
  }

  // Update user password
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const objectId = new ObjectId(userId);
    await this.updateOne({ _id: objectId }, { $set: { password: hashedPassword, updated_at: new Date() } });
  }
}
