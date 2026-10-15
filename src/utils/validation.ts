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

export function parseDate(value: unknown, field: string): Date {
  if (typeof value !== "string") throw new AppError(400, `${field} debe ser una fecha ISO 8601`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AppError(400, `${field} debe ser una fecha ISO 8601 valida`);
  return date;
}
