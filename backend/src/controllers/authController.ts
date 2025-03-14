import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userName, email, password } = req.body;

        // Validar que el correo electrónico no exista en la base de datos
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Crear contraseña hasheada
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Crear un nuevo usuario
        const newUser = new User({
            userName,
            email,
            password: hashedPassword,
        });

        // Guardar el nuevo usuario en la base de datos
        await newUser.save();

        // Generar un token JWT
        const token = jwt.sign({ id: newUser._id }, JWT_SECRET as string, { expiresIn: "7d" });

        // Enviar la respuesta con el token y los datos del usuario
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
            },
        })
    } catch (error) {
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por correo electrónico
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Verificar la contraseña
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Generar un token JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET as string, { expiresIn: "7d" });

        // Enviar la respuesta con el token y los datos del usuario
        res.status(200).json({
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}
