import { NextFunction, Request, Response } from "express";
import { installationService } from "../services/installation.service";

export const installationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await installationService.create(req.body)); } catch (error) { next(error); }
  },
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await installationService.list()); } catch (error) { next(error); }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try { res.json(await installationService.get(req.params.id)); } catch (error) { next(error); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await installationService.update(req.params.id, req.body)); } catch (error) { next(error); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await installationService.remove(req.params.id); res.status(204).send(); } catch (error) { next(error); }
  },
};
