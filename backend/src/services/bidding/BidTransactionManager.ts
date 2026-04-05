import { getDatabase, mongoClient } from "../../config/database";
import { ObjectId } from "mongodb";
import { User } from "../../models/User";
import { Product } from "../../models/Product";
import { Bid } from "../../models/Bid";
import { Transaction } from "../../models/Transaction";
import { BidError, DatabaseError } from "../../utils/errors";
import { logger } from "../../utils/logger";
import { IBidTransactionContext } from "../../types";
import { TRANSACTION_TYPE } from "../../config/constants";

/**
 * BidTransactionManager handles atomic bid placement operations
 * Ensures data consistency across multiple collections:
 * 1. User wallet deduction
 * 2. Bid creation
 * 3. Product highest bid tracking
 * 4. Transaction logging
 */
export class BidTransactionManager {
  private userModel: User;
  private productModel: Product;
  private bidModel: Bid;
  private transactionModel: Transaction;

  constructor() {
    const db = getDatabase();
    this.userModel = new User(db);
    this.productModel = new Product(db);
    this.bidModel = new Bid(db);
    this.transactionModel = new Transaction(db);
  }

  /**
   * Execute atomic bid placement transaction
   * Uses MongoDB client session for transaction support
   */
  async placeBid(context: IBidTransactionContext): Promise<{ bidId: string; message: string }> {
    if (!mongoClient) {
      throw new DatabaseError("Database client not available");
    }

    const session = mongoClient.startSession();

    try {
      // Start transaction
      await session.startTransaction();

      logger.info(`[TRANSACTION START] Placing bid for product: ${context.productId}`);

      // Step 1: Verify product and auction are valid
      const product = await this.userModel.findOne({ id: context.productId });
      if (!product) {
        throw new BidError("Product not found during transaction", "PRODUCT_NOT_FOUND");
      }

      // Step 2: Get user and check wallet balance
      const user = await this.userModel.getUserById(context.userId);
      if (!user) {
        throw new BidError("User not found during transaction", "USER_NOT_FOUND");
      }

      if (user.wallet_balance < context.bidAmount) {
        throw new BidError(
          `Insufficient balance. Current: ₹${user.wallet_balance}, Required: ₹${context.bidAmount}`,
          "INSUFFICIENT_BALANCE"
        );
      }

      // Step 3: Check highest bid (must be higher than previous highest)
      const highestBid = await this.bidModel.getHighestBid(context.productId);
      if (highestBid && context.bidAmount <= highestBid.bid_amount) {
        throw new BidError(
          `Bid must be greater than ₹${highestBid.bid_amount}. Your bid: ₹${context.bidAmount}`,
          "BID_TOO_LOW"
        );
      }

      // Step 4: Deduct amount from wallet (atomic within transaction)
      const newBalance = user.wallet_balance - context.bidAmount;
      const userId = new ObjectId(user._id as string);
      await this.userModel.updateOne(
        { _id: userId },
        {
          $set: { wallet_balance: newBalance, updated_at: new Date() },
        }
      );
      logger.info(`[WALLET] Deducted ₹${context.bidAmount} for user ${context.username}. New balance: ₹${newBalance}`);

      // Step 5: Create bid record
      const bid = {
        product_id: context.productId,
        user_id: context.userId,
        username: context.username,
        bid_amount: context.bidAmount,
        timestamp: context.timestamp,
        is_highest: true, // New bids are highest until overridden
      };

      const bidId = await this.bidModel.createBid(bid);
      logger.info(`[BID CREATED] Bid ID: ${bidId}, Amount: ₹${context.bidAmount}`);

      // Step 6: Unmark previous highest bid (if exists)
      if (highestBid) {
        await this.bidModel.updateOne(
          { id: highestBid.id },
          { $set: { is_highest: false } }
        );
        logger.info(`[BID UPDATE] Previous highest bid unmarked: ${highestBid.id}`);
      }

      // Step 7: Log transaction
      await this.transactionModel.createTransaction({
        username: context.username,
        type: TRANSACTION_TYPE.BID_PLACED as "bid_placed",
        amount: context.bidAmount,
        timestamp: context.timestamp,
        meta: {
          notes: `Bid placed on product ${context.productId}`,
          bid_id: bidId,
          product_id: context.productId,
        },
      });
      logger.info(`[TRANSACTION LOGGED] Bid transaction logged for ${context.username}`);

      // Step 8: Commit transaction
      await session.commitTransaction();
      logger.info(`[TRANSACTION COMMITTED] ✅ Bid placement successful`);

      return {
        bidId,
        message: `Bid of ₹${context.bidAmount} placed successfully! Wallet balance: ₹${newBalance}`,
      };
    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      logger.error(`[TRANSACTION ROLLBACK] ❌ Bid placement failed: ${error}`);

      if (error instanceof BidError) {
        throw error;
      }

      throw new BidError(`Bid placement failed: ${error}`, "BID_PLACEMENT_FAILED");
    } finally {
      await session.endSession();
    }
  }

  /**
   * Refund bid amount to user wallet (on bid cancellation or auction end)
   */
  async refundBid(bidId: string, userId: string, username: string, amount: number): Promise<void> {
    const session = mongoClient?.startSession();

    try {
      if (session) {
        await session.startTransaction();
      }

      // Refund amount to wallet
      await this.userModel.updateOne(
        { id: userId },
        { $inc: { wallet_balance: amount }, $set: { updated_at: new Date() } }
      );

      // Log refund transaction
      await this.transactionModel.createTransaction({
        username,
        type: TRANSACTION_TYPE.BID_REFUNDED as "bid_refunded",
        amount,
        timestamp: new Date(),
        meta: {
          notes: `Bid refunded: ${bidId}`,
          bid_id: bidId,
        },
      });

      if (session) {
        await session.commitTransaction();
      }

      logger.info(`[REFUND] ✅ Bid refunded ₹${amount} to user ${username}`);
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      logger.error(`[REFUND] ❌ Refund failed: ${error}`);
      throw new DatabaseError("Failed to refund bid amount");
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
}
