# SportBook

Aplicación web para administrar instalaciones deportivas, canchas y horarios, y permitir que los usuarios reserven espacios disponibles.

Esta segunda entrega incorpora autenticación con JWT, roles, reservaciones, cancelación con historial, clima mediante Open-Meteo y una interfaz web sencilla.

## Tecnologías

- Node.js, Express y TypeScript
- MongoDB y Mongoose
- HTML, JavaScript y Tailwind CSS
- JWT y bcrypt para autenticación
- Open-Meteo como servicio externo de clima
- Docker y Docker Compose
- Arquitectura: Route → Controller → Service → Repository → Model → MongoDB

## Ejecución con Docker

1. Copia `.env.example` como `.env`.
2. Asigna a `JWT_SECRET` una cadena privada de al menos 32 caracteres.
3. Construye e inicia los contenedores:

```bash
docker compose up -d --build
```

Abre `http://localhost:3000` en el navegador.

Para detener la aplicación:

```bash
docker compose down
```

Los datos se conservan en el volumen `mongo_data`. `docker compose down -v` también elimina ese volumen y debe usarse únicamente cuando se quiera borrar la base de datos local.

## Ejecución local

1. Instala Node.js 20 y MongoDB.
2. Copia `.env.example` como `.env` y configura `MONGODB_URI` y `JWT_SECRET`.
3. Ejecuta:

```bash
npm install
npm run build
npm start
```

## Funcionalidades de la entrega 2

- Registro e inicio de sesión con contraseña cifrada.
- Autenticación mediante token JWT.
- Roles `CLIENT` y `ADMIN`.
- CRUD de instalaciones, canchas y horarios para administradores.
- Horarios concretos de exactamente una hora.
- Consulta de clima actual por instalación mediante Open-Meteo.
- Creación de reservaciones sobre horarios disponibles.
- Prevención de dos reservaciones activas sobre el mismo horario.
- Cancelación lógica: la reservación se conserva como `CANCELLED` y el horario vuelve a `AVAILABLE`.
- Rechazo de creación o reservación de horarios pasados.
- Interfaz web para demostrar los flujos principales.

## Roles

### CLIENT

Puede registrarse, iniciar sesión, consultar catálogos y clima, reservar horarios y cancelar sus reservaciones.

### ADMIN

Tiene las funciones anteriores y además puede crear, actualizar o eliminar instalaciones, canchas y horarios. El registro público siempre crea cuentas `CLIENT`; el rol administrativo debe asignarse de forma controlada en la base de datos.

## Endpoints principales

| Método | Endpoint | Propósito | Acceso |
|---|---|---|---|
| GET | `/api/health` | Verificar el servidor | Público |
| POST | `/api/auth/register` | Registrar un cliente | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| GET | `/api/auth/me` | Consultar la sesión | Autenticado |
| GET | `/api/auth/users` | Listar usuarios | ADMIN |
| GET | `/api/installations` | Listar instalaciones | Público |
| GET | `/api/installations/:id/weather` | Consultar clima actual | Público |
| POST | `/api/installations` | Crear instalación | ADMIN |
| PATCH | `/api/installations/:id` | Actualizar instalación | ADMIN |
| DELETE | `/api/installations/:id` | Eliminar instalación | ADMIN |
| GET | `/api/courts` | Listar canchas | Público |
| POST | `/api/courts` | Crear cancha | ADMIN |
| PATCH | `/api/courts/:id` | Actualizar cancha | ADMIN |
| DELETE | `/api/courts/:id` | Eliminar cancha | ADMIN |
| GET | `/api/time-slots` | Listar horarios | Público |
| POST | `/api/time-slots` | Crear horario | ADMIN |
| PATCH | `/api/time-slots/:id` | Actualizar horario | ADMIN |
| DELETE | `/api/time-slots/:id` | Eliminar horario | ADMIN |
| POST | `/api/reservations` | Reservar un horario | Autenticado |
| GET | `/api/reservations` | Consultar reservaciones | Autenticado |
| PATCH | `/api/reservations/:id/cancel` | Cancelar una reservación | Autenticado |

Las altas responden `201 Created`; las consultas y actualizaciones exitosas, `200 OK`; y las eliminaciones físicas exitosas, `204 No Content`. Los errores tienen la forma `{ "error": "mensaje", "details": ... }` y utilizan códigos como `400`, `401`, `403`, `404` y `409`.

## Reglas principales

- Una cancha pertenece a una instalación existente y activa.
- Un horario pertenece a una cancha existente y dura exactamente una hora.
- Los horarios nuevos deben estar en el futuro.
- No puede repetirse la misma hora de inicio para una cancha.
- Un horario admite como máximo una reservación `CONFIRMED`.
- Una reservación cancelada se conserva como historial y deja libre el horario.
- Las operaciones administrativas requieren un JWT con rol `ADMIN`.
- No se publican contraseñas, tokens ni secretos en el repositorio.

## Verificación

Para comprobar que TypeScript compila:

```bash
npm run build
```

Para ejecutar automáticamente el recorrido principal de la entrega 2 sobre una base de datos temporal:

```bash
npm run verify:second-delivery
```

También puede probarse desde la interfaz:

1. Iniciar sesión.
2. Consultar el clima de una instalación.
3. Reservar un horario `AVAILABLE`.
4. Intentar reservarlo otra vez y comprobar el error `409 Conflict`.
5. Cancelar la reservación y comprobar que queda en el historial y el horario vuelve a estar disponible.

## Próximas etapas

Google OAuth, carga de imágenes con Cloudinary, actualizaciones en tiempo real con Socket.IO, pruebas automatizadas completas, documentación OpenAPI, CI/CD y despliegue.

## Uso de inteligencia artificial

Se utilizó ChatGPT/Codex como apoyo para analizar requisitos, revisar la arquitectura, implementar funcionalidades y preparar la documentación. Las decisiones y resultados fueron revisados mediante compilación y pruebas manuales de los flujos.
