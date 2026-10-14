import { Schema, model } from "mongoose";

const courtSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: String,
      required: true,
      enum: ["futbol", "padel", "tenis"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Court = model("Court", courtSchema);