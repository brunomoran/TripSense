import Post from "../models/Post";
import User from "../models/User";
import { Request, Response, NextFunction } from "express";

export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const posts = await Post.find().populate("user", "username").populate("itinerary");
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
}