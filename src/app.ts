import path from "path";
import express from "express";
import { errorMiddleware } from "./middleware/error.middleware";
import { authRoutes } from "./routes/auth.routes";
import { courtRoutes } from "./routes/court.routes";
import { installationRoutes } from "./routes/installation.routes";
import { reservationRoutes } from "./routes/reservation.routes";
import { timeSlotRoutes } from "./routes/time-slot.routes";

export const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "Backend de reservaciones deportivas" });
});
app.use("/api/auth", authRoutes);
app.use("/api/installations", installationRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/time-slots", timeSlotRoutes);
app.use("/api/reservations", reservationRoutes);
app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use(errorMiddleware);