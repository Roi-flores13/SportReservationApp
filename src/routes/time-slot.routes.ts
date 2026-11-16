import { Router } from "express";
import { timeSlotController } from "../controllers/time-slot.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

export const timeSlotRoutes = Router();
timeSlotRoutes.post("/", authenticate, requireRole("ADMIN"), timeSlotController.create);
timeSlotRoutes.get("/", timeSlotController.list);
timeSlotRoutes.get("/:id", timeSlotController.get);
timeSlotRoutes.patch("/:id", authenticate, requireRole("ADMIN"), timeSlotController.update);
timeSlotRoutes.delete("/:id", authenticate, requireRole("ADMIN"), timeSlotController.remove);
