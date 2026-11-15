import { NextFunction, Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await authService.register(req.body));
    } catch (error) {
      next(error);
    }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await authService.login(req.body));
    } catch (error) {
      next(error);
    }
  },
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await authService.me(req.user!.userId));
    } catch (error) {
      next(error);
    }
  },
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await authService.listUsers());
    } catch (error) {
      next(error);
    }
  },
};