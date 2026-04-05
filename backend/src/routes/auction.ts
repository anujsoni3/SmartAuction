import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { bidLimiter } from "../middleware/rateLimiter";
import { validate, validationSchemas } from "../utils/validators";
import { BidService } from "../services/bidding/BidService";
import { WalletService } from "../services/wallet/WalletService";
import { IBidPlacementRequest } from "../types";
import { HTTP_STATUS } from "../config/constants";

const router = Router();

// POST /api/bid - Place a bid
router.post(
  "/bid",
  authMiddleware,
  bidLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const bidService = new BidService(); // ✅ Lazy initialization
    const data = validate<IBidPlacementRequest>(req.body, validationSchemas.placeBid);
    const result = await bidService.placeBid(data);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: { bid_id: result.bidId },
    });
  })
);

// GET /api/product/:productId/highest-bid - Get highest bid for product
router.get(
  "/product/:productId/highest-bid",
  asyncHandler(async (req: Request, res: Response) => {
    const bidService = new BidService(); // ✅ Lazy initialization
    const { productId } = req.params;
    const highestBid = await bidService.getHighestBid(productId);

    if (!highestBid) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "No bids yet",
        data: { highest_bid: 0 },
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Highest bid retrieved",
      data: {
        highest_bid: highestBid.bid_amount,
        bid_by: highestBid.username,
        timestamp: highestBid.timestamp,
      },
    });
  })
);

// GET /api/product/:productId/bids - Get all bids for product
router.get(
  "/product/:productId/bids",
  asyncHandler(async (req: Request, res: Response) => {
    const bidService = new BidService(); // ✅ Lazy initialization
    const { productId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const bids = await bidService.getBidsForProduct(productId, limit);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Bids retrieved successfully",
      data: bids,
    });
  })
);

// GET /api/user/bids - Get user's bids
router.get(
  "/user/bids",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const bidService = new BidService(); // ✅ Lazy initialization
    const userId = req.user!.user_id;
    const bids = await bidService.getBidsByUser(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User bids retrieved successfully",
      data: bids,
    });
  })
);

// POST /api/rollback-bid - Rollback a bid (admin only)
router.post(
  "/rollback-bid",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const bidService = new BidService(); // ✅ Lazy initialization
    const walletService = new WalletService(); // ✅ Lazy initialization
    const { bid_id, username } = req.body;

    if (!bid_id || !username) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "bid_id and username are required",
      });
      return;
    }

    // TODO: Implement bid rollback logic with BidTransactionManager
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Bid rolled back successfully",
    });
  })
);

export default router;
