import { Db } from "mongodb";
import { BaseModel } from "./BaseModel";
import { IProduct } from "../types";
import { COLLECTIONS } from "../config/constants";

export class Product extends BaseModel {
  constructor(db: Db) {
    super(db, COLLECTIONS.PRODUCTS);
  }

  // Create new product
  async createProduct(productData: IProduct): Promise<string> {
    const product = {
      ...productData,
      status: "unsold",
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await this.insertOne(product);
    return result.insertedId.toString();
  }

  // Get product by ID
  async getProductById(productId: string): Promise<IProduct | null> {
    return (await this.findOne({ id: productId })) as IProduct | null;
  }

  // Get products by auction
  async getProductsByAuctionId(auctionId: string): Promise<IProduct[]> {
    return (await this.find({ auction_id: auctionId })) as IProduct[];
  }

  // Get unsold products by auction
  async getUnsoldProductsByAuctionId(auctionId: string): Promise<IProduct[]> {
    return (await this.find({ auction_id: auctionId, status: "unsold" })) as IProduct[];
  }

  // Update product
  async updateProduct(productId: string, updates: Partial<IProduct>): Promise<void> {
    await this.updateOne({ id: productId }, { $set: { ...updates, updated_at: new Date() } });
  }

  // Mark product as sold
  async markAsSold(productId: string, boughtBy: string): Promise<void> {
    await this.updateOne({ id: productId }, { $set: { status: "sold", sold_to: boughtBy, updated_at: new Date() } });
  }

  // List all products with pagination
  async listProducts(limit: number = 100, skip: number = 0): Promise<IProduct[]> {
    return (await this.find({}, limit, skip)) as IProduct[];
  }

  // Check if product exists
  async productExists(productId: string): Promise<boolean> {
    return await this.exists({ id: productId });
  }

  // Get highest bid for product
  async getProductHighestBid(productId: string): Promise<number> {
    const bidsCollection = this.db.collection(COLLECTIONS.BIDS);
    const result = await bidsCollection
      .find({ product_id: productId })
      .sort({ bid_amount: -1 })
      .limit(1)
      .toArray();
    return result.length > 0 ? result[0].bid_amount : 0;
  }
}
