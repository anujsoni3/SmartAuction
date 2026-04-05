import { Db } from "mongodb";
import { BaseModel } from "./BaseModel";
import { ITransaction } from "../types";
import { COLLECTIONS } from "../config/constants";

export class Transaction extends BaseModel {
  constructor(db: Db) {
    super(db, COLLECTIONS.TRANSACTIONS);
  }

  // Create new transaction
  async createTransaction(transactionData: ITransaction): Promise<string> {
    const transaction = {
      ...transactionData,
      timestamp: transactionData.timestamp || new Date(),
    };
    const result = await this.insertOne(transaction);
    return result.insertedId.toString();
  }

  // Get transactions by username
  async getTransactionsByUsername(username: string, limit: number = 100, skip: number = 0): Promise<ITransaction[]> {
    return (await this.find({ username }, limit, skip)) as ITransaction[];
  }

  // Get transactions by type
  async getTransactionsByType(type: string, limit: number = 100): Promise<ITransaction[]> {
    return (await this.find({ type }, limit)) as ITransaction[];
  }

  // Get transaction history for user
  async getUserTransactionHistory(username: string): Promise<ITransaction[]> {
    return (await this.find({ username })) as ITransaction[];
  }

  // Get transactions by date range
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<ITransaction[]> {
    return (await this.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    })) as ITransaction[];
  }

  // Count transactions by type
  async countTransactionsByType(type: string): Promise<number> {
    return await this.countDocuments({ type });
  }

  // Get wallet topups
  async getWalletTopups(username: string): Promise<ITransaction[]> {
    return (await this.find({ username, type: "topup" })) as ITransaction[];
  }

  // Get bid transactions
  async getBidTransactions(username: string): Promise<ITransaction[]> {
    return (await this.find({
      username,
      type: { $in: ["bid_placed", "bid_refunded"] },
    })) as ITransaction[];
  }
}
