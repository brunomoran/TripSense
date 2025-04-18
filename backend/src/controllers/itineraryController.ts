import { Request, Response, NextFunction } from "express";
import Itinerary from "../models/Itinerary";

export const getAllItineraries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itineraries = await Itinerary.find({ userId: req.params.userId });
        res.status(200).json(itineraries);
    } catch (error) {
        next(error);
    }
}

export const getItineraryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itinerary = await Itinerary.findById(req.params.id);
        if (!itinerary) {
            res.status(404).json({ message: "Itinerary not found" });
        }
        res.status(200).json(itinerary);
    } catch (error) {
        next(error);
    }
}

export const createItinerary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const newItinerary = new Itinerary(req.body);
        const savedItinerary = await newItinerary.save();
        res.status(201).json(savedItinerary);
    } catch (error) {
        next(error);
    }
}

export const updateItinerary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updated = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ message: "Itinerario no encontrado" });
        }
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export const deleteItinerary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deleted = await Itinerary.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: "Itinerario no encontrado" });
        }
        res.status(200).json({ message: "Itinerario eliminado" });
    } catch (error) {
        next(error);
    }
}