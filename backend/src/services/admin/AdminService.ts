import { getDatabase } from "../../config/database";
import { Admin } from "../../models/Admin";
import { User } from "../../models/User";
import { NotFoundError } from "../../utils/errors";
import { logger } from "../../utils/logger";

export class AdminService {
  private adminModel: Admin;
  private userModel: User;

  constructor() {
    const db = getDatabase();
    this.adminModel = new Admin(db);
    this.userModel = new User(db);
  }

  /**
   * Get admin profile
   */
  async getAdminProfile(adminId: string): Promise<any> {
    const admin = await this.adminModel.getAdminById(adminId);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return {
      id: admin._id,
      name: admin.name,
      username: admin.username,
      mobile_number: admin.mobile_number,
      email: admin.email,
      role: admin.role,
    };
  }

  /**
   * Get all users (for admin management)
   */
  async getAllUsers(limit: number = 100): Promise<any[]> {
    const users = await this.userModel.find({}, limit);
    return users.map((u) => ({
      id: u._id,
      name: u.name,
      username: u.username,
      mobile_number: u.mobile_number,
      email: u.email,
      wallet_balance: u.wallet_balance,
      total_auctions: u.auctions.length,
    }));
  }

  /**
   * Get user details
   */
  async getUserDetails(userId: string): Promise<any> {
    const user = await this.userModel.getUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      mobile_number: user.mobile_number,
      email: user.email,
      wallet_balance: user.wallet_balance,
      total_auctions: user.auctions.length,
    };
  }

  /**
   * Get all admins (for super admin only)
   */
  async getAllAdmins(): Promise<any[]> {
    const admins = await this.adminModel.listAdmins();
    return admins.map((a) => ({
      id: a._id,
      name: a.name,
      username: a.username,
      mobile_number: a.mobile_number,
      email: a.email,
      role: a.role,
    }));
  }
}
