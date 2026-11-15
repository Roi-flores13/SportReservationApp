import { AppError } from "../errors/app-error";
import { AuthPayload } from "../middleware/auth.middleware";
import { courtRepository } from "../repositories/court.repository";
import { installationRepository } from "../repositories/installation.repository";
import { reservationRepository } from "../repositories/reservation.repository";
import { timeSlotRepository } from "../repositories/time-slot.repository";
import { requireObjectId, requireText } from "../utils/validation";

export const reservationService = {
  async create(user: AuthPayload, body: Record<string, unknown>) {
    const timeSlotId = requireText(body.timeSlotId, "timeSlotId");
    requireObjectId(timeSlotId, "timeSlotId");

    const slot = await timeSlotRepository.findById(timeSlotId);
    if (!slot) {
      throw new AppError(404, "Horario no encontrado");
    }

    if (slot.status !== "AVAILABLE") {
      throw new AppError(409, "El horario no esta disponible para reservar");
    }

    // Verificar que la cancha y la sede estén activas
    const courtIdObj = slot.courtId as unknown as { _id?: unknown };
    const courtIdStr = String(courtIdObj._id ?? slot.courtId);
    const court = await courtRepository.findById(courtIdStr);
    if (!court || !court.active) {
      throw new AppError(400, "La cancha asociada no esta activa");
    }

    const instIdObj = court.installationId as unknown as { _id?: unknown };
    const instIdStr = String(instIdObj._id ?? court.installationId);
    const installation = await installationRepository.findById(instIdStr);
    if (!installation || !installation.active) {
      throw new AppError(400, "La instalacion asociada no esta activa");
    }

    // Operación atómica sobre el horario para prevenir doble reservación concurrente
    const claimedSlot = await timeSlotRepository.claimAvailableSlot(timeSlotId);
    if (!claimedSlot) {
      throw new AppError(409, "El horario ya fue reservado o bloqueado");
    }

    try {
      return await reservationRepository.create({
        userId: user.userId,
        timeSlotId,
        status: "CONFIRMED",
      });
    } catch (error) {
      // Revertir estado del horario si falla la creación del documento
      await timeSlotRepository.updateById(timeSlotId, { status: "AVAILABLE" });
      throw error;
    }
  },

  async list(user: AuthPayload, status?: string) {
    const filters: Record<string, unknown> = {};
    if (user.role !== "ADMIN") {
      filters.userId = user.userId;
    }
    if (status) {
      if (status !== "CONFIRMED" && status !== "CANCELLED") {
        throw new AppError(400, "status debe ser CONFIRMED o CANCELLED");
      }
      filters.status = status;
    }
    return reservationRepository.findAll(filters);
  },

  async get(id: string, user: AuthPayload) {
    requireObjectId(id);
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError(404, "Reservacion no encontrada");
    }

    const ownerObj = reservation.userId as unknown as { _id?: unknown };
    const ownerId = String(ownerObj._id ?? reservation.userId);
    if (user.role !== "ADMIN" && ownerId !== user.userId) {
      throw new AppError(403, "No tienes permiso para consultar esta reservacion");
    }
    return reservation;
  },

  async cancel(id: string, user: AuthPayload) {
    requireObjectId(id);
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError(404, "Reservacion no encontrada");
    }

    const ownerObj = reservation.userId as unknown as { _id?: unknown };
    const ownerId = String(ownerObj._id ?? reservation.userId);
    if (user.role !== "ADMIN" && ownerId !== user.userId) {
      throw new AppError(403, "No tienes permiso para cancelar esta reservacion");
    }

    if (reservation.status === "CANCELLED") {
      throw new AppError(409, "La reservacion ya se encuentra cancelada");
    }

    const slotObj = reservation.timeSlotId as unknown as { _id?: unknown };
    const slotId = String(slotObj._id ?? reservation.timeSlotId);

    // Liberar el horario de vuelta a AVAILABLE
    await timeSlotRepository.updateById(slotId, { status: "AVAILABLE" });

    // Marcar como CANCELLED conservando el registro en el historial
    return reservationRepository.updateById(id, {
      status: "CANCELLED",
      cancelledAt: new Date(),
    });
  },
};