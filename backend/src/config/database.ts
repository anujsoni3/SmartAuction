import { MongoClient, Db } from "mongodb";
import { env } from "./env";
import { logger } from "../utils/logger";

let mongoClient: MongoClient;
let db: Db;

export async function connectDatabase(): Promise<Db> {
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(env.MONGO_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await mongoClient.connect();
      db = mongoClient.db(env.DB_NAME);

      // Verify connection
      await db.admin().ping();
      logger.info(`✅ Connected to MongoDB: ${env.DB_NAME}`);

      // Create indexes (optional, can be done separately)
      await createIndexes(db);
    }
    return db;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error}`);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    logger.info("✅ Disconnected from MongoDB");
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectDatabase() first.");
  }
  return db;
}

async function createIndexes(database: Db): Promise<void> {
  try {
    // Users collection indexes
    const usersCollection = database.collection("users");
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { sparse: true });

    // Admins collection indexes
    const adminsCollection = database.collection("admins");
    await adminsCollection.createIndex({ username: 1 }, { unique: true });

    // Auctions collection indexes
    const auctionsCollection = database.collection("auctions");
    await auctionsCollection.createIndex({ id: 1 }, { unique: true });
    await auctionsCollection.createIndex({ valid_until: 1 });
    await auctionsCollection.createIndex({ created_by: 1 });

    // Products collection indexes
    const productsCollection = database.collection("products");
    await productsCollection.createIndex({ id: 1 }, { unique: true });
    await productsCollection.createIndex({ auction_id: 1 });
    await productsCollection.createIndex({ status: 1 });

    // Bids collection indexes
    const bidsCollection = database.collection("bids");
    await bidsCollection.createIndex({ product_id: 1 });
    await bidsCollection.createIndex({ user_id: 1 });
    await bidsCollection.createIndex({ timestamp: 1 });
    await bidsCollection.createIndex({ product_id: 1, timestamp: -1 });

    // Transactions collection indexes
    const transactionsCollection = database.collection("transactions");
    await transactionsCollection.createIndex({ username: 1 });
    await transactionsCollection.createIndex({ type: 1 });
    await transactionsCollection.createIndex({ timestamp: 1 });

    logger.info("✅ Database indexes created successfully");
  } catch (error) {
    logger.error(`⚠️  Index creation error: ${error}`);
    // Don't throw - indexes might already exist
  }
}

export { mongoClient };
