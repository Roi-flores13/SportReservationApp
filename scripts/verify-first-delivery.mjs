import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../dist/app.js";

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri("sportbook-evidence"));
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

async function request(label, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers ?? {}) },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  console.log(`\n${label}\n${options.method ?? "GET"} ${path}\nHTTP ${response.status}\n${JSON.stringify(body, null, 2)}`);
  if (response.status >= 400) throw new Error(`${label} fallo con HTTP ${response.status}`);
  return body;
}

try {
  const installation = await request("FEATURE 1 - CREAR INSTALACION", "/api/installations", {
    method: "POST",
    body: JSON.stringify({
      name: "Unidad Deportiva ITESO",
      address: "Periferico Sur 8585, Tlaquepaque, Jalisco",
      latitude: 20.607,
      longitude: -103.416,
    }),
  });
  const court = await request("FEATURE 2 - CREAR CANCHA", "/api/courts", {
    method: "POST",
    body: JSON.stringify({ installationId: installation._id, name: "Cancha Norte", sport: "futbol" }),
  });
  await request("FEATURE 3 - CREAR HORARIO", "/api/time-slots", {
    method: "POST",
    body: JSON.stringify({
      courtId: court._id,
      startTime: "2026-10-20T18:00:00.000Z",
      endTime: "2026-10-20T19:00:00.000Z",
    }),
  });
  await request("VERIFICAR PERSISTENCIA Y RELACIONES", `/api/time-slots?courtId=${court._id}&status=AVAILABLE`);
  console.log("\nRESULTADO: 3 features verificadas correctamente con MongoDB temporal.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
}
