import { Court } from "../models/court.model";

export const courtRepository = {
  create: (data: Record<string, unknown>) => Court.create(data),
  findAll: (installationId?: string) =>
    Court.find(installationId ? { installationId } : {})
      .populate("installationId", "name address")
      .sort({ createdAt: -1 }),
  findById: (id: string) => Court.findById(id).populate("installationId", "name address"),
  updateById: (id: string, data: Record<string, unknown>) =>
    Court.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      "installationId",
      "name address"
    ),
  deleteById: (id: string) => Court.findByIdAndDelete(id),
  existsByInstallation: (installationId: string) => Court.exists({ installationId }),
};
