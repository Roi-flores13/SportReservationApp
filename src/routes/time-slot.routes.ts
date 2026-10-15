import { Router } from "express";
import { timeSlotController } from "../controllers/time-slot.controller";

export const timeSlotRoutes = Router();
timeSlotRoutes.post("/", timeSlotController.create);
timeSlotRoutes.get("/", timeSlotController.list);
timeSlotRoutes.get("/:id", timeSlotController.get);
timeSlotRoutes.patch("/:id", timeSlotController.update);
timeSlotRoutes.delete("/:id", timeSlotController.remove);
