import { isValidObjectId } from "mongoose";
import { AppError } from "../errors/app-error";

export function requireObjectId(value: string, field = "id"): void {
  if (!isValidObjectId(value)) throw new AppError(400, `${field} no es un identificador valido`);
}

export function requireText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(400, `${field} es obligatorio`);
  }
  return value.trim();
}

export function requireEmail(value: unknown, field = "email"): string {
  const email = requireText(value, field).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, `${field} no tiene un formato de correo valido`);
  }
  return email;
}

export function parseDate(value: unknown, field: string): Date {
  if (typeof value !== "string") throw new AppError(400, `${field} debe ser una fecha ISO 8601`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AppError(400, `${field} debe ser una fecha ISO 8601 valida`);
  return date;
}
