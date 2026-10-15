import { Router } from "express";
import { courtController } from "../controllers/court.controller";

export const courtRoutes = Router();
courtRoutes.post("/", courtController.create);
courtRoutes.get("/", courtController.list);
courtRoutes.get("/:id", courtController.get);
courtRoutes.patch("/:id", courtController.update);
courtRoutes.delete("/:id", courtController.remove);
