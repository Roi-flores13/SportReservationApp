import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error";
import { getJwtSecret } from "../middleware/auth.middleware";
import { userRepository } from "../repositories/user.repository";
import { requireEmail, requireText } from "../utils/validation";

export const authService = {
  async register(body: Record<string, unknown>) {
    const name = requireText(body.name, "name");
    const email = requireEmail(body.email, "email");
    const password = requireText(body.password, "password");

    if (password.length < 6) {
      throw new AppError(400, "password debe tener al menos 6 caracteres");
    }

    let role: "CLIENT" | "ADMIN" = "CLIENT";
    if (body.role !== undefined) {
      if (body.role !== "CLIENT" && body.role !== "ADMIN") {
        throw new AppError(400, "role debe ser CLIENT o ADMIN");
      }
      role = body.role;
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, "Ya existe un usuario con ese correo");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { userId: String(user._id), role: user.role, name: user.name, email: user.email },
      getJwtSecret(),
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    };
  },

  async login(body: Record<string, unknown>) {
    const email = requireEmail(body.email, "email");
    const password = requireText(body.password, "password");

    const user = await userRepository.findByEmail(email);
    if (!user || !user.active) {
      throw new AppError(401, "Credenciales invalidas");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError(401, "Credenciales invalidas");
    }

    const token = jwt.sign(
      { userId: String(user._id), role: user.role, name: user.name, email: user.email },
      getJwtSecret(),
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "Usuario no encontrado");
    return user;
  },

  listUsers: () => userRepository.findAll(),
};