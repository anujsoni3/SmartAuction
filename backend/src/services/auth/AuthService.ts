import { getDatabase } from "../../config/database";
import { User } from "../../models/User";
import { Admin } from "../../models/Admin";
import { HashService } from "./HashService";
import { generateToken } from "../../utils/jwt";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors";
import { IRegisterRequest, ILoginRequest, IChangePasswordRequest, IUserResponse, IAdminResponse, ILoginResponse } from "../../types";
import { logger } from "../../utils/logger";

export class AuthService {
  private userModel: User;
  private adminModel: Admin;
  private hashService: HashService;

  constructor() {
    const db = getDatabase();
    this.userModel = new User(db);
    this.adminModel = new Admin(db);
    this.hashService = new HashService();
  }

  // User Registration
  async registerUser(data: IRegisterRequest): Promise<string> {
    // Check if user already exists
    if (await this.userModel.usernameExists(data.username)) {
      throw new ConflictError("Username already exists");
    }

    // Hash password
    const hashedPassword = await this.hashService.hashPassword(data.password);

    // Create user
    const userId = await this.userModel.createUser({
      name: data.name,
      username: data.username,
      password: hashedPassword,
      mobile_number: data.mobile_number,
      email: data.email,
      auctions: [],
      wallet_balance: 500,
    });

    logger.info(`✅ User registered: ${data.username}`);
    return userId;
  }

  // User Login
  async loginUser(data: ILoginRequest): Promise<ILoginResponse> {
    const user = await this.userModel.getUserByUsername(data.username);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify password
    const isPasswordValid = await this.hashService.comparePasswords(data.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid password");
    }

    // Generate token
    const token = generateToken({
      user_id: user._id!.toString(),
      username: user.username,
      role: "user",
    });

    logger.info(`✅ User logged in: ${data.username}`);

    return {
      message: "Login successful",
      token,
      user: {
        id: user._id!.toString(),
        name: user.name,
        username: user.username,
        mobile_number: user.mobile_number,
        email: user.email,
        auctions: user.auctions,
      } as IUserResponse,
    };
  }

  // User Change Password
  async changeUserPassword(data: IChangePasswordRequest): Promise<void> {
    const user = await this.userModel.getUserByUsername(data.username);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify old password
    const isPasswordValid = await this.hashService.comparePasswords(data.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await this.hashService.hashPassword(data.new_password);

    // Update password
    await this.userModel.updatePassword(user._id!.toString(), hashedNewPassword);

    logger.info(`✅ User password changed: ${data.username}`);
  }

  // Admin Registration
  async registerAdmin(data: IRegisterRequest): Promise<string> {
    // Check if admin already exists
    if (await this.adminModel.usernameExists(data.username)) {
      throw new ConflictError("Admin username already exists");
    }

    // Hash password
    const hashedPassword = await this.hashService.hashPassword(data.password);

    // Create admin
    const adminId = await this.adminModel.createAdmin({
      name: data.name,
      username: data.username,
      password: hashedPassword,
      mobile_number: data.mobile_number,
      email: data.email,
      role: "admin",
    });

    logger.info(`✅ Admin registered: ${data.username}`);
    return adminId;
  }

  // Admin Login
  async loginAdmin(data: ILoginRequest): Promise<ILoginResponse> {
    const admin = await this.adminModel.getAdminByUsername(data.username);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    // Verify password
    const isPasswordValid = await this.hashService.comparePasswords(data.password, admin.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid password");
    }

    // Generate token
    const token = generateToken({
      user_id: admin._id!.toString(),
      username: admin.username,
      role: "admin",
    });

    logger.info(`✅ Admin logged in: ${data.username}`);

    return {
      message: "Admin login successful",
      token,
      user: {
        id: admin._id!.toString(),
        name: admin.name,
        username: admin.username,
        mobile_number: admin.mobile_number,
        email: admin.email,
        role: admin.role,
      } as IAdminResponse,
    };
  }

  // Admin Change Password
  async changeAdminPassword(data: IChangePasswordRequest): Promise<void> {
    const admin = await this.adminModel.getAdminByUsername(data.username);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    // Verify old password
    const isPasswordValid = await this.hashService.comparePasswords(data.password, admin.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await this.hashService.hashPassword(data.new_password);

    // Update password
    await this.adminModel.updatePassword(admin._id!.toString(), hashedNewPassword);

    logger.info(`✅ Admin password changed: ${data.username}`);
  }
}
