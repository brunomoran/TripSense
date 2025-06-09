import Post from "../models/Post";
import { Request, Response, NextFunction } from "express";

export const validatePost = (req: Request, res: Response, next: NextFunction) => {
  const { itineraryId } = req.body;
  if (!itineraryId) res.status(400).json({ message: "Itinerario es requerido" });
  next();
};