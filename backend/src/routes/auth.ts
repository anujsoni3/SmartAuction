import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { authLimiter } from "../middleware/rateLimiter";
import { validate, validationSchemas } from "../utils/validators";
import { AuthService } from "../services/auth/AuthService";
import { IRegisterRequest, ILoginRequest, IChangePasswordRequest } from "../types";
import { HTTP_STATUS } from "../config/constants";

const router = Router();

// ============ USER AUTH ============

// POST /api/register - Register new user
router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(); // ✅ Lazy initialization
    const data = validate<IRegisterRequest>(req.body, validationSchemas.register);
    const userId = await authService.registerUser(data);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: { id: userId },
    });
  })
);

// POST /api/login - Login user
router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(); // ✅ Lazy initialization
    const data = validate<ILoginRequest>(req.body, validationSchemas.login);
    const result = await authService.loginUser(data);

    // Set secure cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 10 * 60 * 60 * 1000, // 10 hours
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  })
);

// POST /api/change-password - Change user password
router.post(
  "/change-password",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(); // ✅ Lazy initialization
    const data = validate<IChangePasswordRequest>(req.body, validationSchemas.changePassword);
    await authService.changeUserPassword(data);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Password updated successfully",
    });
  })
);

// ============ ADMIN AUTH ============

// POST /api/admin/register - Register new admin
router.post(
  "/admin/register",
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(); // ✅ Lazy initialization
    const data = validate<IRegisterRequest>(req.body, validationSchemas.register);
    const adminId = await authService.registerAdmin(data);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Admin registered successfully",
      data: { id: adminId },
    });
  })
);

// POST /api/admin/login - Login admin
router.post(
  "/admin/login",
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(); // ✅ Lazy initialization
    const data = validate<ILoginRequest>(req.body, validationSchemas.login);
    const result = await authService.loginAdmin(data);

    // Set secure cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 10 * 60 * 60 * 1000, // 10 hours
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  })
);

// POST /api/admin/change-password - Change admin password
router.post(
  "/admin/change-password",
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const authService = new AuthService(); // ✅ Lazy initialization
    const data = validate<IChangePasswordRequest>(req.body, validationSchemas.changePassword);
    await authService.changeAdminPassword(data);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Password updated successfully",
    });
  })
);

export default router;
