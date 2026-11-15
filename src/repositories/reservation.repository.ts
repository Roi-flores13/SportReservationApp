import { Reservation } from "../models/reservation.model";

const populateOptions = [
  { path: "userId", select: "name email role" },
  {
    path: "timeSlotId",
    select: "startTime endTime status courtId",
    populate: {
      path: "courtId",
      select: "name sport installationId",
      populate: { path: "installationId", select: "name address" },
    },
  },
];

export const reservationRepository = {
  create: async (data: Record<string, unknown>) => {
    const created = await Reservation.create(data);
    return Reservation.findById(created._id).populate(populateOptions);
  },
  findAll: (filters: Record<string, unknown> = {}) =>
    Reservation.find(filters).populate(populateOptions).sort({ createdAt: -1 }),
  findById: (id: string) => Reservation.findById(id).populate(populateOptions),
  updateById: (id: string, data: Record<string, unknown>) =>
    Reservation.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      populateOptions
    ),
  existsByTimeSlot: (timeSlotId: string) => Reservation.exists({ timeSlotId }),
};