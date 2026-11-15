import { InferSchemaType, Schema, model } from "mongoose";

const reservationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timeSlotId: {
      type: Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// Evita que un mismo horario tenga más de una reservación CONFIRMED al mismo tiempo,
// pero permite conservar el historial de reservaciones CANCELLED sobre ese horario.
reservationSchema.index(
  { timeSlotId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "CONFIRMED" } }
);

export type ReservationDocument = InferSchemaType<typeof reservationSchema>;
export const Reservation = model("Reservation", reservationSchema);