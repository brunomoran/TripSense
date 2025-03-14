import { Request, Response, NextFunction } from "express";

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const { userName, email, password } = req.body;

    // Validar los campos
    if (!userName || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El correo electrónico no es válido" });
    }

    // Validar la fortaleza de la contraseña
    if (password.length < 6) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    next();
}

export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Validar los campos
    if (!email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    next();
}