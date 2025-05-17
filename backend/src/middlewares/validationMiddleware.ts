import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, password } = req.body;

    // Validar los campos
    if (!userName || !email || !password) {
        res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: "El correo electrónico no es válido" });
    }

    // Validar la fortaleza de la contraseña
    if (password.length < 6) {
        res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    next();
}

export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validar los campos
    if (!email || !password) {
        res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    next();
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = (decoded as { userId: string }).userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const validateUserUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allowedFields = ["userName", "profileImageUrl", "bio"];
  const updateKeys = Object.keys(req.body);

  const invalidFields = updateKeys.filter((key) => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: `Invalid fields in update: ${invalidFields.join(", ")}`,
    });
  }

  next();
};
