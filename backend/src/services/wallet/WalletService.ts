import { getDatabase } from "../../config/database";
import { User } from "../../models/User";
import { Transaction } from "../../models/Transaction";
import { WalletError, NotFoundError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { TRANSACTION_TYPE } from "../../config/constants";

export class WalletService {
  private userModel: User;
  private transactionModel: Transaction;

  constructor() {
    const db = getDatabase();
    this.userModel = new User(db);
    this.transactionModel = new Transaction(db);
  }

  /**
   * Get wallet balance for a user
   */
  async getWalletBalance(username: string): Promise<number> {
    const balance = await this.userModel.getWalletBalance(username);
    if (balance === null) {
      throw new NotFoundError("User not found");
    }
    return balance;
  }

  /**
   * Top up wallet balance
   */
  async topupWallet(userId: string, username: string, amount: number): Promise<{ message: string; newBalance: number }> {
    // Validate amount
    if (!amount || amount <= 0) {
      throw new WalletError("Top-up amount must be greater than 0");
    }

    // Get current balance
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update wallet balance
    const newBalance = user.wallet_balance + amount;
    await this.userModel.updateWalletBalance(userId, amount);

    // Log transaction
    await this.transactionModel.createTransaction({
      username,
      type: TRANSACTION_TYPE.TOPUP as "topup",
      amount,
      timestamp: new Date(),
      meta: {
        notes: "Manual top-up",
      },
    });

    logger.info(`✅ Wallet top-up: user=${username}, amount=₹${amount}, newBalance=₹${newBalance}`);

    return {
      message: `₹${amount} added to wallet. New balance: ₹${newBalance}`,
      newBalance,
    };
  }

  /**
   * Deduct amount from wallet (used for unsuccessful auction settlements)
   */
  async deductBalance(userId: string, username: string, amount: number, reason: string): Promise<void> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.wallet_balance < amount) {
      throw new WalletError("Insufficient wallet balance");
    }

    // Deduct balance
    await this.userModel.updateWalletBalance(userId, -amount);

    // Log transaction
    await this.transactionModel.createTransaction({
      username,
      type: TRANSACTION_TYPE.AUCTION_LOST as "auction_lost",
      amount,
      timestamp: new Date(),
      meta: {
        notes: reason,
      },
    });

    logger.info(`✅ Wallet deduction: user=${username}, amount=₹${amount}, reason=${reason}`);
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(username: string, limit: number = 100): Promise<any> {
    return await this.transactionModel.getTransactionsByUsername(username, limit);
  }

  /**
   * Get wallet topup history
   */
  async getTopupHistory(username: string): Promise<any> {
    return await this.transactionModel.getWalletTopups(username);
  }

  /**
   * Get bid history
   */
  async getBidHistory(username: string): Promise<any> {
    return await this.transactionModel.getBidTransactions(username);
  }
}
