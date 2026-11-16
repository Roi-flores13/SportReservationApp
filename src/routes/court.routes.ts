import { Router } from "express";
import { courtController } from "../controllers/court.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

export const courtRoutes = Router();
courtRoutes.post("/", authenticate, requireRole("ADMIN"), courtController.create);
courtRoutes.get("/", courtController.list);
courtRoutes.get("/:id", courtController.get);
courtRoutes.patch("/:id", authenticate, requireRole("ADMIN"), courtController.update);
courtRoutes.delete("/:id", authenticate, requireRole("ADMIN"), courtController.remove);
