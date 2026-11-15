import { NextFunction, Request, Response } from "express";
import { reservationService } from "../services/reservation.service";

export const reservationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await reservationService.create(req.user!, req.body));
    } catch (error) {
      next(error);
    }
  },
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(
        await reservationService.list(req.user!, req.query.status as string | undefined)
      );
    } catch (error) {
      next(error);
    }
  },
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await reservationService.get(req.params.id, req.user!));
    } catch (error) {
      next(error);
    }
  },
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await reservationService.cancel(req.params.id, req.user!));
    } catch (error) {
      next(error);
    }
  },
};