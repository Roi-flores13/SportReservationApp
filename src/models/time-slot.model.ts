import { InferSchemaType, Schema, model } from "mongoose";

const timeSlotSchema = new Schema(
  {
    courtId: { type: Schema.Types.ObjectId, ref: "Court", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "BLOCKED"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true, versionKey: false }
);

timeSlotSchema.index({ courtId: 1, startTime: 1 }, { unique: true });

export type TimeSlotDocument = InferSchemaType<typeof timeSlotSchema>;
export const TimeSlot = model("TimeSlot", timeSlotSchema);
