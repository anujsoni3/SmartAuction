import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { validate, validationSchemas } from "../utils/validators";
import { AuctionService } from "../services/auction/AuctionService";
import { ProductService } from "../services/auction/ProductService";
import { HTTP_STATUS } from "../config/constants";

const router = Router();

// ============ AUCTION ROUTES ============

// POST /api/admin/auction - Create new auction
router.post(
  "/admin/auction",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const auctionService = new AuctionService(); // ✅ Lazy initialization
    const data = validate(req.body, validationSchemas.createAuction);
    const adminId = req.user!.user_id;

    const result = await auctionService.createAuction(data, adminId);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: result.message,
      data: { auction_id: result.id },
    });
  })
);

// GET /api/admin/auctions - List all auctions
router.get(
  "/admin/auctions",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const auctionService = new AuctionService(); // ✅ Lazy initialization
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const auctions = await auctionService.listAuctions(limit, skip);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Auctions retrieved successfully",
      data: auctions,
    });
  })
);

// GET /api/admin/auction/:auctionId - Get auction details
router.get(
  "/admin/auction/:auctionId",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const auctionService = new AuctionService(); // ✅ Lazy initialization
    const { auctionId } = req.params;
    const auction = await auctionService.getAuctionDetails(auctionId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Auction details retrieved",
      data: auction,
    });
  })
);

// PUT /api/admin/auction/:auctionId - Update auction
router.put(
  "/admin/auction/:auctionId",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const auctionService = new AuctionService(); // ✅ Lazy initialization
    const { auctionId } = req.params;
    const result = await auctionService.updateAuction(auctionId, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  })
);

// ============ PRODUCT ROUTES ============

// POST /api/admin/product - Create new product
router.post(
  "/admin/product",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const productService = new ProductService(); // ✅ Lazy initialization
    const data = validate(req.body, validationSchemas.createProduct);

    const result = await productService.createProduct(data);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: result.message,
      data: { product_id: result.id },
    });
  })
);

// GET /api/admin/products - List all products
router.get(
  "/admin/products",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const productService = new ProductService(); // ✅ Lazy initialization
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

    const products = await productService.listProducts(limit, skip);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  })
);

// GET /api/admin/product/:productId - Get product details
router.get(
  "/admin/product/:productId",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const productService = new ProductService(); // ✅ Lazy initialization
    const { productId } = req.params;
    const product = await productService.getProductDetails(productId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Product details retrieved",
      data: product,
    });
  })
);

// PUT /api/admin/product/:productId - Update product
router.put(
  "/admin/product/:productId",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const productService = new ProductService(); // ✅ Lazy initialization
    const { productId } = req.params;
    const result = await productService.updateProduct(productId, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  })
);

export default router;
