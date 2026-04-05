import { Collection, Db, InsertOneResult, UpdateResult, DeleteResult, Filter, Document } from "mongodb";
import { DatabaseError } from "../utils/errors";
import { logger } from "../utils/logger";

export class BaseModel {
  protected collection: Collection;
  protected db: Db;

  constructor(db: Db, collectionName: string) {
    this.db = db;
    this.collection = db.collection(collectionName);
  }

  // Find single document
  async findOne(query: Filter<Document>): Promise<Document | null> {
    try {
      return await this.collection.findOne(query);
    } catch (error) {
      logger.error(`findOne error: ${error}`);
      throw new DatabaseError(`Failed to find document in ${this.collection.collectionName}`);
    }
  }

  // Find multiple documents
  async find(query: Filter<Document>, limit: number = 0, skip: number = 0): Promise<Document[]> {
    try {
      return await this.collection.find(query).limit(limit).skip(skip).toArray();
    } catch (error) {
      logger.error(`find error: ${error}`);
      throw new DatabaseError(`Failed to find documents in ${this.collection.collectionName}`);
    }
  }

  // Insert single document
  async insertOne(doc: Document): Promise<InsertOneResult> {
    try {
      return await this.collection.insertOne(doc);
    } catch (error: any) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        throw new DatabaseError(`Duplicate value for field: ${field}`);
      }
      logger.error(`insertOne error: ${error}`);
      throw new DatabaseError(`Failed to insert document into ${this.collection.collectionName}`);
    }
  }

  // Insert multiple documents
  async insertMany(docs: Document[]): Promise<any> {
    try {
      return await this.collection.insertMany(docs);
    } catch (error) {
      logger.error(`insertMany error: ${error}`);
      throw new DatabaseError(`Failed to insert documents into ${this.collection.collectionName}`);
    }
  }

  // Update single document
  async updateOne(query: Filter<Document>, updates: Document): Promise<UpdateResult> {
    try {
      return await this.collection.updateOne(query, updates);
    } catch (error) {
      logger.error(`updateOne error: ${error}`);
      throw new DatabaseError(`Failed to update document in ${this.collection.collectionName}`);
    }
  }

  // Update multiple documents
  async updateMany(query: Filter<Document>, updates: Document): Promise<UpdateResult> {
    try {
      return await this.collection.updateMany(query, updates);
    } catch (error) {
      logger.error(`updateMany error: ${error}`);
      throw new DatabaseError(`Failed to update documents in ${this.collection.collectionName}`);
    }
  }

  // Delete single document
  async deleteOne(query: Filter<Document>): Promise<DeleteResult> {
    try {
      return await this.collection.deleteOne(query);
    } catch (error) {
      logger.error(`deleteOne error: ${error}`);
      throw new DatabaseError(`Failed to delete document from ${this.collection.collectionName}`);
    }
  }

  // Delete multiple documents
  async deleteMany(query: Filter<Document>): Promise<DeleteResult> {
    try {
      return await this.collection.deleteMany(query);
    } catch (error) {
      logger.error(`deleteMany error: ${error}`);
      throw new DatabaseError(`Failed to delete documents from ${this.collection.collectionName}`);
    }
  }

  // Count documents
  async countDocuments(query: Filter<Document>): Promise<number> {
    try {
      return await this.collection.countDocuments(query);
    } catch (error) {
      logger.error(`countDocuments error: ${error}`);
      throw new DatabaseError(`Failed to count documents in ${this.collection.collectionName}`);
    }
  }

  // Find and update single document, returning the updated document
  async findOneAndUpdate(query: Filter<Document>, updates: Document): Promise<Document | null> {
    try {
      const result = await this.collection.findOneAndUpdate(query, updates, { returnDocument: "after" });
      return result?.value || null;
    } catch (error) {
      logger.error(`findOneAndUpdate error: ${error}`);
      throw new DatabaseError(`Failed to find and update document in ${this.collection.collectionName}`);
    }
  }

  // Check if document exists
  async exists(query: Filter<Document>): Promise<boolean> {
    try {
      const result = await this.collection.findOne(query, { projection: { _id: 1 } });
      return result !== null;
    } catch (error) {
      logger.error(`exists error: ${error}`);
      throw new DatabaseError(`Failed to check document existence in ${this.collection.collectionName}`);
    }
  }

  // Aggregate documents
  async aggregate(pipeline: Document[]): Promise<Document[]> {
    try {
      return await this.collection.aggregate(pipeline).toArray();
    } catch (error) {
      logger.error(`aggregate error: ${error}`);
      throw new DatabaseError(`Failed to aggregate documents in ${this.collection.collectionName}`);
    }
  }
}
