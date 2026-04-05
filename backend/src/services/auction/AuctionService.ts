import { getDatabase } from "../../config/database";
import { Auction } from "../../models/Auction";
import { Product } from "../../models/Product";
import { NotFoundError, ValidationError } from "../../utils/errors";
import { logger } from "../../utils/logger";

export class AuctionService {
  private auctionModel: Auction;
  private productModel: Product;

  constructor() {
    const db = getDatabase();
    this.auctionModel = new Auction(db);
    this.productModel = new Product(db);
  }

  /**
   * Create a new auction
   */
  async createAuction(auctionData: any, adminId: string): Promise<{ id: string; message: string }> {
    // Validate required fields
    if (!auctionData.id || !auctionData.name || !auctionData.product_ids || !auctionData.valid_until) {
      throw new ValidationError("Missing required fields: id, name, product_ids, valid_until");
    }

    // Validate auction end time is in the future
    const auctionEnd = new Date(auctionData.valid_until);
    if (auctionEnd <= new Date()) {
      throw new ValidationError("Auction end time must be in the future");
    }

    // Create auction
    const auctionId = await this.auctionModel.createAuction({
      id: auctionData.id,
      name: auctionData.name,
      product_ids: auctionData.product_ids,
      valid_until: auctionData.valid_until,
      registrations: [],
      created_by: adminId,
      settled: false,
    });

    logger.info(`✅ Auction created: ${auctionData.id} by admin ${adminId}`);

    return {
      id: auctionId,
      message: "Auction created successfully",
    };
  }

  /**
   * Get auction details
   */
  async getAuctionDetails(auctionId: string): Promise<any> {
    const auction = await this.auctionModel.getAuctionById(auctionId);
    if (!auction) {
      throw new NotFoundError("Auction not found");
    }

    // Get products for this auction
    const products = await this.productModel.getProductsByAuctionId(auctionId);

    return {
      id: auction.id,
      name: auction.name,
      valid_until: auction.valid_until,
      registered_users: auction.registrations.length,
      total_products: auction.product_ids.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })),
      settled: auction.settled,
    };
  }

  /**
   * List all auctions
   */
  async listAuctions(limit: number = 100, skip: number = 0): Promise<any[]> {
    const auctions = await this.auctionModel.listAuctions(limit, skip);
    return auctions.map((auction) => ({
      id: auction.id,
      name: auction.name,
      valid_until: auction.valid_until,
      registered_users: auction.registrations.length,
      total_products: auction.product_ids.length,
      settled: auction.settled,
    }));
  }

  /**
   * Update auction
   */
  async updateAuction(auctionId: string, updates: any): Promise<{ message: string }> {
    const auction = await this.auctionModel.getAuctionById(auctionId);
    if (!auction) {
      throw new NotFoundError("Auction not found");
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ["name", "valid_until", "product_ids"];
    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (key in updates) {
        updateData[key] = updates[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    await this.auctionModel.updateAuction(auctionId, updateData);

    logger.info(`✅ Auction updated: ${auctionId}`);

    return { message: "Auction updated successfully" };
  }

  /**
   * Settle auction (mark as completed)
   */
  async settleAuction(auctionId: string): Promise<{ message: string }> {
    const auction = await this.auctionModel.getAuctionById(auctionId);
    if (!auction) {
      throw new NotFoundError("Auction not found");
    }

    if (auction.settled) {
      throw new ValidationError("Auction is already settled");
    }

    await this.auctionModel.settleAuction(auctionId);

    logger.info(`✅ Auction settled: ${auctionId}`);

    return { message: "Auction settled successfully" };
  }

  /**
   * Check if auction is still active
   */
  async isAuctionActive(auctionId: string): Promise<boolean> {
    return await this.auctionModel.isAuctionActive(auctionId);
  }
}
