import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate, validationSchemas } from "../utils/validators";
import { WalletService } from "../services/wallet/WalletService";
import { IWalletTopupRequest } from "../types";
import { HTTP_STATUS } from "../config/constants";

const router = Router();

// GET /api/wallet - Get wallet balance
router.get(
  "/wallet",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const walletService = new WalletService(); // ✅ Lazy initialization
    const userId = req.user!.user_id;
    const balance = await walletService.getWalletBalance(req.user!.username);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Wallet balance retrieved",
      data: { wallet_balance: balance },
    });
  })
);

// POST /api/wallet/topup - Top up wallet
router.post(
  "/wallet/topup",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const walletService = new WalletService(); // ✅ Lazy initialization
    const data = validate<IWalletTopupRequest>(req.body, validationSchemas.topup);
    const userId = req.user!.user_id;
    const username = req.user!.username;

    const result = await walletService.topupWallet(userId, username, data.amount);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: { new_balance: result.newBalance },
    });
  })
);

// GET /api/wallet/transactions - Get wallet transaction history
router.get(
  "/wallet/transactions",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const walletService = new WalletService(); // ✅ Lazy initialization
    const username = req.user!.username;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const transactions = await walletService.getTransactionHistory(username, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Transaction history retrieved",
      data: transactions,
    });
  })
);

export default router;
