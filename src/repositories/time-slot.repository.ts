import { TimeSlot } from "../models/time-slot.model";

export const timeSlotRepository = {
  create: (data: Record<string, unknown>) => TimeSlot.create(data),
  findAll: (courtId?: string, status?: string) =>
    TimeSlot.find({ ...(courtId ? { courtId } : {}), ...(status ? { status } : {}) })
      .populate("courtId", "name sport installationId")
      .sort({ startTime: 1 }),
  findById: (id: string) =>
    TimeSlot.findById(id).populate("courtId", "name sport installationId"),
  updateById: (id: string, data: Record<string, unknown>) =>
    TimeSlot.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      "courtId",
      "name sport installationId"
    ),
  deleteById: (id: string) => TimeSlot.findByIdAndDelete(id),
  existsByCourt: (courtId: string) => TimeSlot.exists({ courtId }),
};
