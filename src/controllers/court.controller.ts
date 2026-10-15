import { NextFunction, Request, Response } from "express";
import { courtService } from "../services/court.service";

export const courtController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await courtService.create(req.body)); } catch (error) { next(error); }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await courtService.list(req.query.installationId as string | undefined)); } catch (error) { next(error); }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try { res.json(await courtService.get(req.params.id)); } catch (error) { next(error); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await courtService.update(req.params.id, req.body)); } catch (error) { next(error); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await courtService.remove(req.params.id); res.status(204).send(); } catch (error) { next(error); }
  },
};
