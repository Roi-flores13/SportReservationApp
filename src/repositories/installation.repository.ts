import { Installation } from "../models/installation.model";

export const installationRepository = {
  create: (data: Record<string, unknown>) => Installation.create(data),
  findAll: () => Installation.find().sort({ createdAt: -1 }),
  findById: (id: string) => Installation.findById(id),
  updateById: (id: string, data: Record<string, unknown>) =>
    Installation.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id: string) => Installation.findByIdAndDelete(id),
};
