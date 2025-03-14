import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Middleware para acceder a rutas que requieren autenticación
// Verifica si el token JWT es válido y si el usuario existe en la base de datos
export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verificar el token
            const decoded: any = jwt.verify(token, JWT_SECRET as string);

            // Buscar el usuario en la base de datos
            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error: any) {
            console.error(error);
            res.status(401).json({ message: "No autorizado" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "No autorizado" });
    }
}