import { Request, Response, NextFunction } from "express";
import { IItinerary } from "../models/Itinerary";
import Itinerary from "../models/Itinerary";

export const validateItinerary = (req: Request, res: Response, next: NextFunction) => {
    const itinerary = req.body as Partial<IItinerary>;

    if (!itinerary.name || typeof itinerary.name !== "string") {
        res.status(400).json({ message: "El nombre del itinerario es obligatorio." });
    }

    if (!itinerary.startDate || !itinerary.endDate) {
        res.status(400).json({ message: "Las fechas de inicio y fin son obligatorias." });
    }

    if (itinerary.endDate && itinerary.startDate && new Date(itinerary.endDate) < new Date(itinerary.startDate)) {
        res.status(400).json({ message: "La fecha de fin no puede ser anterior a la de inicio." });
    }

    if (!Array.isArray(itinerary.days)) {
        res.status(400).json({ message: "El itinerario debe contener una lista de días." });
    }

    if (!itinerary.days) {
        res.status(400).json({ message: "El itinerario debe contener una lista de días." });
        return;
    }
    for (const day of itinerary.days) {
        if (!day.date || !Array.isArray(day.activities)) {
            res.status(400).json({ message: "Cada día debe tener una fecha y una lista de actividades." });
        }

        for (const activity of day.activities) {
            if (!activity.startTime || !activity.endTime || !activity.poi) {
                res.status(400).json({ message: "Cada actividad debe tener hora de inicio, fin y un POI." });
            }

            if (
                !activity.poi.name ||
                !activity.poi.location ||
                typeof activity.poi.location.lat !== "number" ||
                typeof activity.poi.location.lng !== "number"
            ) {
                res.status(400).json({ message: "El POI debe tener nombre y una localización válida." });
            }
        }
    }

    next();
};

export const checkItineraryExists = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const itinerary = await Itinerary.findById(id);
    if (!itinerary) {
        res.status(404).json({ message: "Itinerario no encontrado." });
    }
    next();
};