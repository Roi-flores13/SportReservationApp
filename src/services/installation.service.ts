import { AppError } from "../errors/app-error";
import { courtRepository } from "../repositories/court.repository";
import { installationRepository } from "../repositories/installation.repository";
import { requireObjectId, requireText } from "../utils/validation";
import { weatherService } from "./weather.service";

function installationData(body: Record<string, unknown>, partial = false) {
  const data: Record<string, unknown> = {};
  if (!partial || body.name !== undefined) data.name = requireText(body.name, "name");
  if (!partial || body.address !== undefined) data.address = requireText(body.address, "address");
  for (const field of ["latitude", "longitude"] as const) {
    if (!partial || body[field] !== undefined) {
      if (typeof body[field] !== "number") throw new AppError(400, `${field} debe ser numerico`);
      data[field] = body[field];
    }
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") throw new AppError(400, "active debe ser booleano");
    data.active = body.active;
  }
  return data;
}

export const installationService = {
  create: (body: Record<string, unknown>) => installationRepository.create(installationData(body)),
  list: () => installationRepository.findAll(),
  async get(id: string) {
    requireObjectId(id);
    const item = await installationRepository.findById(id);
    if (!item) throw new AppError(404, "Instalacion no encontrada");
    return item;
  },
  async getWeather(id: string) {
    const installation = await this.get(id);
    const weather = await weatherService.getCurrentWeather(
      installation.latitude,
      installation.longitude
    );
    return {
      installation: {
        _id: installation._id,
        name: installation.name,
        address: installation.address,
        latitude: installation.latitude,
        longitude: installation.longitude,
      },
      weather,
    };
  },
  async update(id: string, body: Record<string, unknown>) {
    requireObjectId(id);
    const item = await installationRepository.updateById(id, installationData(body, true));
    if (!item) throw new AppError(404, "Instalacion no encontrada");
    return item;
  },
  async remove(id: string) {
    requireObjectId(id);
    if (await courtRepository.existsByInstallation(id)) {
      throw new AppError(409, "No se puede eliminar una instalacion que tiene canchas");
    }
    const item = await installationRepository.deleteById(id);
    if (!item) throw new AppError(404, "Instalacion no encontrada");
  },
};