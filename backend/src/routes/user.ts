import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate, validationSchemas } from "../utils/validators";
import { UserService } from "../services/user/UserService";
import { HTTP_STATUS } from "../config/constants";

const router = Router();

// GET /api/auctions - List all active auctions
router.get(
  "/auctions",
  asyncHandler(async (req: Request, res: Response) => {
    const userService = new UserService(); // ✅ Lazy initialization
    const auctions = await userService.listActiveAuctions();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Auctions retrieved successfully",
      data: auctions,
    });
  })
);

// GET /api/auctions/:auctionId/products - Get products in an auction
router.get(
  "/auctions/:auctionId/products",
  asyncHandler(async (req: Request, res: Response) => {
    const { auctionId } = req.params;

    // This would need ProductService, temporarily returning mock
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Products retrieved successfully",
      data: [],
    });
  })
);

// POST /api/auctions/register - Register for an auction
router.post(
  "/auctions/register",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userService = new UserService(); // ✅ Lazy initialization
    const { auction_id } = req.body;
    const userId = req.user!.user_id;

    if (!auction_id) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "auction_id is required",
      });
      return;
    }

    const result = await userService.registerForAuction(userId, auction_id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  })
);

// GET /api/user/profile - Get user profile
router.get(
  "/user/profile",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userService = new UserService(); // ✅ Lazy initialization
    const userId = req.user!.user_id;
    const profile = await userService.getUserProfile(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  })
);

// GET /api/user/auctions - Get user's registered auctions
router.get(
  "/user/auctions",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userService = new UserService(); // ✅ Lazy initialization
    const userId = req.user!.user_id;
    const auctions = await userService.getUserAuctions(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User auctions retrieved successfully",
      data: auctions,
    });
  })
);

export default router;
