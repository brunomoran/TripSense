import Post from "../models/Post";
import User from "../models/User";
import Itinerary from "../models/Itinerary";
import { Request, Response, NextFunction } from "express";

export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Buscar todos los posts y poblar los campos de usuario e itinerario
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'userName profilePicture')
            .populate({
                path: 'itinerary',
                select: 'name destination startDate endDate isPublic days completeRoute',
            });

        res.status(200).json(posts);
        return;
    } catch (error) {
        next(error);
    }
}

export const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id).populate("user", "username").populate("itinerary");
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        res.status(200).json(post);
        return;
    } catch (error) {
        next(error);
    }
}

export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { itineraryId, description } = req.body;

        // Validar que el itinerario existe
        const existingItinerary = await Itinerary.findById(itineraryId);
        if (!existingItinerary) {
            res.status(404).json({ error: "Itinerary not found" });
            return;
        }

        // Crear el nuevo post
        const newPost = new Post({
            user: req.user._id,
            itinerary: itineraryId,
            description: description?.trim() || "",
            likes: []
        });

        await newPost.save();

        // Actualizar el número de posts del usuario
        await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

        res.status(201).json(newPost);
    } catch (error) {
        next(error);
    }
}

export const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { description } = req.body;

        // Validar que el post existe
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        // Actualizar el post
        post.description = description?.trim() || "";
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validar que el post existe
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        // Eliminar el post
        await post.deleteOne();

        // Actualizar el número de posts del usuario
        await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: -1 } });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export const likePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validar que el post existe
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        // Verificar si el usuario ya ha dado like
        const userIndex = post.likes.indexOf(req.user._id);
        if (userIndex === -1) {
            // Eliminar el like
            post.likes.splice(userIndex, 1);
        } else {
            // Agregar el like
            post.likes.push(req.user._id);
        }

        await post.save();

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
}