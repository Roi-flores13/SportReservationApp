import { Router } from "express";
import { installationController } from "../controllers/installation.controller";

export const installationRoutes = Router();
installationRoutes.post("/", installationController.create);
installationRoutes.get("/", installationController.list);
installationRoutes.get("/:id", installationController.get);
installationRoutes.patch("/:id", installationController.update);
installationRoutes.delete("/:id", installationController.remove);
