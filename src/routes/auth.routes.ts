import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

export const authRoutes = Router();
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authenticate, authController.me);
authRoutes.get("/users", authenticate, requireRole("ADMIN"), authController.listUsers);