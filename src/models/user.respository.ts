import { User } from "../models/user.model";

export const userRepository = {
  create: (data: Record<string, unknown>) => User.create(data),
  findByEmail: (email: string) => User.findOne({ email: email.toLowerCase().trim() }),
  findById: (id: string) => User.findById(id).select("-password"),
  findAll: () => User.find().select("-password").sort({ createdAt: -1 }),
};