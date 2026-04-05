import { Db, ObjectId } from "mongodb";
import { BaseModel } from "./BaseModel";
import { IAdmin } from "../types";
import { COLLECTIONS } from "../config/constants";

export class Admin extends BaseModel {
  constructor(db: Db) {
    super(db, COLLECTIONS.ADMINS);
  }

  // Create new admin
  async createAdmin(adminData: Omit<IAdmin, "_id">): Promise<string> {
    const admin = {
      ...adminData,
      role: "admin" as const,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await this.insertOne(admin);
    return result.insertedId.toString();
  }

  // Get admin by username
  async getAdminByUsername(username: string): Promise<IAdmin | null> {
    return (await this.findOne({ username, role: "admin" })) as IAdmin | null;
  }

  // Get admin by ID
  async getAdminById(adminId: string): Promise<IAdmin | null> {
    const objectId = new ObjectId(adminId);
    return (await this.findOne({ _id: objectId, role: "admin" })) as IAdmin | null;
  }

  // Check if admin username exists
  async usernameExists(username: string): Promise<boolean> {
    return await this.exists({ username, role: "admin" });
  }

  // Update admin password
  async updatePassword(adminId: string, hashedPassword: string): Promise<void> {
    const objectId = new ObjectId(adminId);
    await this.updateOne({ _id: objectId }, { $set: { password: hashedPassword, updated_at: new Date() } });
  }

  // List all admins (for admin management)
  async listAdmins(): Promise<IAdmin[]> {
    return (await this.find({ role: "admin" })) as IAdmin[];
  }
}
