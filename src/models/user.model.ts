import { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 150,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["CLIENT", "ADMIN"],
      default: "CLIENT",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);