import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller";
import { authenticate } from "../middleware/auth.middleware";

export const reservationRoutes = Router();
reservationRoutes.use(authenticate);
reservationRoutes.post("/", reservationController.create);
reservationRoutes.get("/", reservationController.list);
reservationRoutes.get("/:id", reservationController.get);
reservationRoutes.patch("/:id/cancel", reservationController.cancel);