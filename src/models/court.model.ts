import { InferSchemaType, Schema, model } from "mongoose";

const courtSchema = new Schema(
  {
    installationId: {
      type: Schema.Types.ObjectId,
      ref: "Installation",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
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
  { timestamps: true, versionKey: false }
);

courtSchema.index({ installationId: 1, name: 1 }, { unique: true });

export type CourtDocument = InferSchemaType<typeof courtSchema>;
export const Court = model("Court", courtSchema);
