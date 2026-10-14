import "dotenv/config";
import express from "express";
import { connectDatabase } from "./config/database";

const app = express();

// Permite recibir cuerpos JSON en las peticiones.
app.use(express.json());

// Endpoint básico para comprobar que el Backend responde.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend de reservaciones deportivas",
  });
});

// Aquí registrarás las rutas de tus features.
// Ejemplo, cuando exista ese archivo:
// app.use("/api/courts", courtRoutes);

async function startServer(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535");
  }

  // Espera la conexión antes de iniciar el servidor.
  await connectDatabase();

  // Escucha en todas las interfaces del contenedor.
  app.listen(port, "0.0.0.0", () => {
    console.log(`Backend escuchando en el puerto ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error(
    "No se pudo iniciar el Backend:",
    error instanceof Error ? error.message : "Error desconocido"
  );

  process.exit(1);
});