import bcrypt from "bcryptjs";
import { logger } from "../../utils/logger";

export class HashService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      logger.error(`Password hashing failed: ${error}`);
      throw new Error("Failed to hash password");
    }
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error(`Password comparison failed: ${error}`);
      throw new Error("Failed to compare passwords");
    }
  }
}
