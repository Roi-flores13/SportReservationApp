import { NextFunction, Request, Response } from "express";
import { timeSlotService } from "../services/time-slot.service";

export const timeSlotController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await timeSlotService.create(req.body)); } catch (error) { next(error); }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await timeSlotService.list(req.query.courtId as string | undefined, req.query.status as string | undefined));
    } catch (error) { next(error); }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try { res.json(await timeSlotService.get(req.params.id)); } catch (error) { next(error); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await timeSlotService.update(req.params.id, req.body)); } catch (error) { next(error); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await timeSlotService.remove(req.params.id); res.status(204).send(); } catch (error) { next(error); }
  },
};
