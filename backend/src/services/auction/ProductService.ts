import { getDatabase } from "../../config/database";
import { Product } from "../../models/Product";
import { NotFoundError, ValidationError } from "../../utils/errors";
import { logger } from "../../utils/logger";

export class ProductService {
  private productModel: Product;

  constructor() {
    const db = getDatabase();
    this.productModel = new Product(db);
  }

  /**
   * Create a new product
   */
  async createProduct(productData: any): Promise<{ id: string; message: string }> {
    // Validate required fields
    if (!productData.id || !productData.name) {
      throw new ValidationError("Missing required fields: id, name");
    }

    // Create product
    const productId = await this.productModel.createProduct({
      id: productData.id,
      name: productData.name,
      description: productData.description,
      auction_id: productData.auction_id,
      status: "unsold",
    });

    logger.info(`✅ Product created: ${productData.id}`);

    return {
      id: productId,
      message: "Product created successfully",
    };
  }

  /**
   * Get product details
   */
  async getProductDetails(productId: string): Promise<any> {
    const product = await this.productModel.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      auction_id: product.auction_id,
      status: product.status,
      sold_to: product.sold_to,
    };
  }

  /**
   * Get products by auction
   */
  async getProductsByAuction(auctionId: string): Promise<any[]> {
    const products = await this.productModel.getProductsByAuctionId(auctionId);
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
    }));
  }

  /**
   * Get unsold products by auction
   */
  async getUnsoldProductsByAuction(auctionId: string): Promise<any[]> {
    const products = await this.productModel.getUnsoldProductsByAuctionId(auctionId);
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
    }));
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, updates: any): Promise<{ message: string }> {
    const product = await this.productModel.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ["name", "description"];
    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (key in updates) {
        updateData[key] = updates[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    await this.productModel.updateProduct(productId, updateData);

    logger.info(`✅ Product updated: ${productId}`);

    return { message: "Product updated successfully" };
  }

  /**
   * List all products
   */
  async listProducts(limit: number = 100, skip: number = 0): Promise<any[]> {
    const products = await this.productModel.listProducts(limit, skip);
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      auction_id: p.auction_id,
    }));
  }
}
