import { AppError } from "../errors/app-error";
import { courtRepository } from "../repositories/court.repository";
import { timeSlotRepository } from "../repositories/time-slot.repository";
import { parseDate, requireObjectId, requireText } from "../utils/validation";

async function timeSlotData(body: Record<string, unknown>, partial = false) {
  const data: Record<string, unknown> = {};
  if (!partial || body.courtId !== undefined) {
    const id = requireText(body.courtId, "courtId");
    requireObjectId(id, "courtId");
    if (!(await courtRepository.findById(id))) throw new AppError(404, "Cancha no encontrada");
    data.courtId = id;
  }
  const start = body.startTime !== undefined ? parseDate(body.startTime, "startTime") : undefined;
  const end = body.endTime !== undefined ? parseDate(body.endTime, "endTime") : undefined;
  if (!partial || start) data.startTime = start;
  if (!partial || end) data.endTime = end;
  if (!partial && (!start || !end)) throw new AppError(400, "startTime y endTime son obligatorios");
  if (start && end && end.getTime() - start.getTime() !== 60 * 60 * 1000) {
    throw new AppError(400, "El horario debe durar exactamente una hora");
  }
  if (body.status !== undefined) {
    if (body.status !== "AVAILABLE" && body.status !== "BLOCKED") {
      throw new AppError(400, "status debe ser AVAILABLE o BLOCKED");
    }
    data.status = body.status;
  }
  return data;
}

export const timeSlotService = {
  create: async (body: Record<string, unknown>) => timeSlotRepository.create(await timeSlotData(body)),
  list: (courtId?: string, status?: string) => {
    if (courtId) requireObjectId(courtId, "courtId");
    if (status && status !== "AVAILABLE" && status !== "BLOCKED") {
      throw new AppError(400, "status debe ser AVAILABLE o BLOCKED");
    }
    return timeSlotRepository.findAll(courtId, status);
  },
  async get(id: string) {
    requireObjectId(id);
    const item = await timeSlotRepository.findById(id);
    if (!item) throw new AppError(404, "Horario no encontrado");
    return item;
  },
  async update(id: string, body: Record<string, unknown>) {
    requireObjectId(id);
    const current = await timeSlotRepository.findById(id);
    if (!current) throw new AppError(404, "Horario no encontrado");
    const data = await timeSlotData(body, true);
    const start = (data.startTime as Date | undefined) ?? current.startTime;
    const end = (data.endTime as Date | undefined) ?? current.endTime;
    if (end.getTime() - start.getTime() !== 60 * 60 * 1000) {
      throw new AppError(400, "El horario debe durar exactamente una hora");
    }
    return timeSlotRepository.updateById(id, data);
  },
  async remove(id: string) {
    requireObjectId(id);
    const item = await timeSlotRepository.deleteById(id);
    if (!item) throw new AppError(404, "Horario no encontrado");
  },
};
