import { Request, Response, NextFunction } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userName, email, password } = req.body;

        // Validar que el correo electrónico no exista en la base de datos
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "El usuario ya existe" });
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

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const { userName, profilePicture, bio } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        if (userId !== req.user.id) {
            return res.status(403).json({ message: "No tienes permiso para actualizar este usuario" });
        }

        if (userName) user.userName = userName;
        if (profilePicture) user.profilePicture = profilePicture;
        if (bio) user.bio = bio;

        await user.save();

        res.status(200).json({
            message: "Usuario actualizado con éxito",
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el usuario" });
    }
}

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.userId;

        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (targetUser.followers.includes(currentUserId)) {
            return res.status(400).json({ message: "Ya sigues a este usuario" });
        }

        // Convert string IDs to ObjectId before pushing
        targetUser.followers.push(new mongoose.Types.ObjectId(currentUserId));
        currentUser.following.push(new mongoose.Types.ObjectId(targetUserId));

        await targetUser.save();
        await currentUser.save();

        res.status(200).json({ message: "Usuario seguido correctamente" });
    } catch (error) {
        console.error("Error en followUser:", error);
        res.status(500).json({ message: "Error al seguir al usuario" });
    }
}

export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = req.user.id;
        const targetUserId = req.params.userId;

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        targetUser.followers = targetUser.followers.filter(
            (id) => id.toString() !== currentUserId
        );
        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== targetUserId
        );

        await targetUser.save();
        await currentUser.save();

        res.status(200).json({ message: "Has dejado de seguir al usuario" });
    } catch (error) {
        console.error("Error en unfollowUser:", error);
        res.status(500).json({ message: "Error al dejar de seguir al usuario" });
    }
}