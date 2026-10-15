import "dotenv/config";
import { app } from "./app";
import { connectDatabase } from "./config/database";

async function startServer(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535");
  }
  await connectDatabase();
  app.listen(port, "0.0.0.0", () => console.log(`Backend escuchando en el puerto ${port}`));
}

startServer().catch((error: unknown) => {
  console.error("No se pudo iniciar el Backend:", error instanceof Error ? error.message : "Error desconocido");
  process.exit(1);
});
