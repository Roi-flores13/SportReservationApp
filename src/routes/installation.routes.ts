import { Router } from "express";
import { installationController } from "../controllers/installation.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

export const installationRoutes = Router();
installationRoutes.post("/", authenticate, requireRole("ADMIN"), installationController.create);
installationRoutes.get("/", installationController.list);
installationRoutes.get("/:id", installationController.get);
installationRoutes.get("/:id/weather", installationController.getWeather);
installationRoutes.patch("/:id", authenticate, requireRole("ADMIN"), installationController.update);
installationRoutes.delete("/:id", authenticate, requireRole("ADMIN"), installationController.remove);
