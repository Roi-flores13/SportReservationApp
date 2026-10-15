import { AppError } from "../errors/app-error";
import { courtRepository } from "../repositories/court.repository";
import { installationRepository } from "../repositories/installation.repository";
import { timeSlotRepository } from "../repositories/time-slot.repository";
import { requireObjectId, requireText } from "../utils/validation";

const SPORTS = ["futbol", "padel", "tenis"];

async function courtData(body: Record<string, unknown>, partial = false) {
  const data: Record<string, unknown> = {};
  if (!partial || body.installationId !== undefined) {
    const id = requireText(body.installationId, "installationId");
    requireObjectId(id, "installationId");
    if (!(await installationRepository.findById(id))) throw new AppError(404, "Instalacion no encontrada");
    data.installationId = id;
  }
  if (!partial || body.name !== undefined) data.name = requireText(body.name, "name");
  if (!partial || body.sport !== undefined) {
    const sport = requireText(body.sport, "sport").toLowerCase();
    if (!SPORTS.includes(sport)) throw new AppError(400, "sport debe ser futbol, padel o tenis");
    data.sport = sport;
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") throw new AppError(400, "active debe ser booleano");
    data.active = body.active;
  }
  return data;
}

export const courtService = {
  create: async (body: Record<string, unknown>) => courtRepository.create(await courtData(body)),
  list: (installationId?: string) => {
    if (installationId) requireObjectId(installationId, "installationId");
    return courtRepository.findAll(installationId);
  },
  async get(id: string) {
    requireObjectId(id);
    const item = await courtRepository.findById(id);
    if (!item) throw new AppError(404, "Cancha no encontrada");
    return item;
  },
  async update(id: string, body: Record<string, unknown>) {
    requireObjectId(id);
    const item = await courtRepository.updateById(id, await courtData(body, true));
    if (!item) throw new AppError(404, "Cancha no encontrada");
    return item;
  },
  async remove(id: string) {
    requireObjectId(id);
    if (await timeSlotRepository.existsByCourt(id)) {
      throw new AppError(409, "No se puede eliminar una cancha que tiene horarios");
    }
    const item = await courtRepository.deleteById(id);
    if (!item) throw new AppError(404, "Cancha no encontrada");
  },
};
