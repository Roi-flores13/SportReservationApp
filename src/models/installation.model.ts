import { InferSchemaType, Schema, model } from "mongoose";

const installationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, required: true, trim: true, maxlength: 250 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

installationSchema.index({ name: 1, address: 1 }, { unique: true });

export type InstallationDocument = InferSchemaType<typeof installationSchema>;
export const Installation = model("Installation", installationSchema);
