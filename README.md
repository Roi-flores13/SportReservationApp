# SportBook

API backend para que pequeños negocios deportivos administren instalaciones, canchas, horarios y reservaciones. Esta primera entrega implementa tres features con persistencia en MongoDB: instalaciones, canchas y horarios concretos de una hora.

## Tecnologías

- Node.js, Express y TypeScript
- MongoDB y Mongoose
- Arquitectura: Route → Controller → Service → Repository → Database
- Docker y Docker Compose

## Ejecución con Docker

```bash
docker compose up --build -d
```

La API queda disponible en `http://localhost:3000`. Para detenerla: `docker compose down`.

## Ejecución local

1. Instala Node.js 20 y MongoDB.
2. Copia `.env.example` como `.env` y ajusta `MONGODB_URI`.
3. Ejecuta `npm install`, `npm run build` y `npm start`.

## Features funcionales

### Instalaciones

CRUD de sedes deportivas. Cada instalación guarda nombre, dirección y coordenadas que posteriormente utilizará Open-Meteo.

### Canchas

CRUD de canchas asociadas a una instalación. Los deportes iniciales son fútbol, pádel y tenis.

### Horarios

CRUD de horarios concretos de exactamente una hora para cada cancha. Un horario puede estar `AVAILABLE` o `BLOCKED`.

## API

| Método | Endpoint | Propósito | HTTP |
|---|---|---|---|
| GET | `/api/health` | Verificar el servidor | 200 |
| POST | `/api/installations` | Crear instalación | 201, 400, 409 |
| GET | `/api/installations` | Listar instalaciones | 200 |
| GET | `/api/installations/:id` | Consultar instalación | 200, 400, 404 |
| PATCH | `/api/installations/:id` | Actualizar instalación | 200, 400, 404 |
| DELETE | `/api/installations/:id` | Eliminar instalación sin canchas | 204, 404, 409 |
| POST | `/api/courts` | Crear cancha | 201, 400, 404, 409 |
| GET | `/api/courts` | Listar; acepta `installationId` | 200, 400 |
| GET | `/api/courts/:id` | Consultar cancha | 200, 400, 404 |
| PATCH | `/api/courts/:id` | Actualizar cancha | 200, 400, 404, 409 |
| DELETE | `/api/courts/:id` | Eliminar cancha sin horarios | 204, 404, 409 |
| POST | `/api/time-slots` | Crear horario | 201, 400, 404, 409 |
| GET | `/api/time-slots` | Listar; acepta `courtId` y `status` | 200, 400 |
| GET | `/api/time-slots/:id` | Consultar horario | 200, 400, 404 |
| PATCH | `/api/time-slots/:id` | Actualizar horario | 200, 400, 404, 409 |
| DELETE | `/api/time-slots/:id` | Eliminar horario | 204, 400, 404 |

### Ejemplos de creación

```json
{
  "name": "Unidad Deportiva ITESO",
  "address": "Periférico Sur 8585, Tlaquepaque, Jalisco",
  "latitude": 20.607,
  "longitude": -103.416
}
```

```json
{
  "installationId": "ID_DE_LA_INSTALACION",
  "name": "Cancha Norte",
  "sport": "futbol"
}
```

```json
{
  "courtId": "ID_DE_LA_CANCHA",
  "startTime": "2026-10-20T18:00:00.000Z",
  "endTime": "2026-10-20T19:00:00.000Z"
}
```

## Reglas implementadas

- Una cancha pertenece a una instalación existente.
- Un horario pertenece a una cancha existente y dura exactamente una hora.
- No puede repetirse la misma hora de inicio en una cancha.
- No se elimina una instalación con canchas ni una cancha con horarios.
- Los errores se devuelven como JSON con códigos HTTP consistentes.

## Próximas etapas

Reservaciones y usuarios, Google OAuth, Socket.IO, Cloudinary, Open-Meteo, pruebas automatizadas, CI/CD, OpenAPI y despliegue.

## Uso de inteligencia artificial

Se utilizó ChatGPT/Codex como apoyo para analizar requisitos, proponer la arquitectura inicial y estructurar la primera versión de las features.
