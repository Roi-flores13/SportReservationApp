import { ErrorRequestHandler } from "express";
import { Error as MongooseError } from "mongoose";
import { AppError } from "../errors/app-error";

interface MongoDuplicateError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message, details: error.details });
    return;
  }
  if (error instanceof MongooseError.ValidationError) {
    res.status(400).json({ error: "Datos invalidos", details: error.message });
    return;
  }
  if ((error as MongoDuplicateError).code === 11000) {
    res.status(409).json({ error: "Ya existe un registro con esos datos", details: (error as MongoDuplicateError).keyValue });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
};
