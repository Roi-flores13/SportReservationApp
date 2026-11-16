import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";

export interface AuthPayload {
  userId: string;
  role: "CLIENT" | "ADMIN";
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe existir y tener al menos 32 caracteres");
  }
  return secret;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "Token de autenticacion requerido"));
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, "Token invalido o expirado"));
  }
}

export function requireRole(...roles: Array<"CLIENT" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "No autenticado"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "No tienes permisos para realizar esta accion"));
      return;
    }
    next();
  };
}
