import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.JWT_SECRET = "verification_secret_with_at_least_32_characters";

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri("sportbook-delivery-2"));

const { app } = await import("../dist/app.js");
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));

const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

async function request(label, path, { expectedStatus = 200, token, ...options } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  assert.equal(
    response.status,
    expectedStatus,
    `${label}: se esperaba HTTP ${expectedStatus}, se obtuvo ${response.status}\n${text}`
  );
  console.log(`OK  HTTP ${response.status}  ${label}`);
  return body;
}

try {
  const registration = await request("registro publico crea un CLIENT", "/api/auth/register", {
    method: "POST",
    expectedStatus: 201,
    body: JSON.stringify({
      name: "Cliente de Prueba",
      email: "cliente@sportbook.test",
      password: "secreto123",
      role: "ADMIN",
    }),
  });
  assert.equal(registration.user.role, "CLIENT");
  const clientToken = registration.token;

  await request("un CLIENT no puede crear instalaciones", "/api/installations", {
    method: "POST",
    expectedStatus: 403,
    token: clientToken,
    body: JSON.stringify({
      name: "Intento sin permiso",
      address: "Direccion de prueba",
      latitude: 20.6,
      longitude: -103.4,
    }),
  });

  const users = mongoose.connection.collection("users");
  const promoted = await users.updateOne(
    { email: "cliente@sportbook.test" },
    { $set: { role: "ADMIN" } }
  );
  assert.equal(promoted.modifiedCount, 1);

  const adminLogin = await request("inicio de sesion con rol ADMIN", "/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "cliente@sportbook.test",
      password: "secreto123",
    }),
  });
  assert.equal(adminLogin.user.role, "ADMIN");
  const adminToken = adminLogin.token;

  const installation = await request("ADMIN crea una instalacion", "/api/installations", {
    method: "POST",
    expectedStatus: 201,
    token: adminToken,
    body: JSON.stringify({
      name: "Unidad Deportiva de Prueba",
      address: "Avenida de Prueba 123",
      latitude: 20.607,
      longitude: -103.416,
    }),
  });

  const court = await request("ADMIN crea una cancha", "/api/courts", {
    method: "POST",
    expectedStatus: 201,
    token: adminToken,
    body: JSON.stringify({
      installationId: installation._id,
      name: "Cancha de Prueba",
      sport: "futbol",
    }),
  });

  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  start.setUTCMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const timeSlot = await request("ADMIN publica un horario futuro", "/api/time-slots", {
    method: "POST",
    expectedStatus: 201,
    token: adminToken,
    body: JSON.stringify({
      courtId: court._id,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }),
  });
  assert.equal(timeSlot.status, "AVAILABLE");

  const reservation = await request("usuario autenticado reserva el horario", "/api/reservations", {
    method: "POST",
    expectedStatus: 201,
    token: clientToken,
    body: JSON.stringify({ timeSlotId: timeSlot._id }),
  });
  assert.equal(reservation.status, "CONFIRMED");

  await request("se rechaza una reservacion duplicada", "/api/reservations", {
    method: "POST",
    expectedStatus: 409,
    token: clientToken,
    body: JSON.stringify({ timeSlotId: timeSlot._id }),
  });

  const cancelled = await request(
    "el usuario cancela y conserva el historial",
    `/api/reservations/${reservation._id}/cancel`,
    {
      method: "PATCH",
      token: clientToken,
    }
  );
  assert.equal(cancelled.status, "CANCELLED");

  const releasedSlot = await request(
    "el horario vuelve a estar disponible",
    `/api/time-slots/${timeSlot._id}`
  );
  assert.equal(releasedSlot.status, "AVAILABLE");

  const history = await request("la cancelacion permanece en el historial", "/api/reservations", {
    token: clientToken,
  });
  assert.equal(history.length, 1);
  assert.equal(history[0].status, "CANCELLED");

  console.log("\nRESULTADO: entrega 2 verificada correctamente de inicio a fin.");
} finally {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await mongo.stop();
}
