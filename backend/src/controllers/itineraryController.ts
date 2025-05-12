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

export const calculateRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const itineraryId = req.params.id;
    const apiKey = res.locals.googleMapsApiKey;

    try {
        const itinerary = await Itinerary.findById(itineraryId);
        if (!itinerary) {
            res.status(404).json({ message: "Itinerary not found" });
        }

        const updatedDays = await Promise.all((itinerary?.days ?? []).map(async (day) => {
            const activities = day.activities;

            for (let i = 0; i < activities.length - 1; i++) {
                const from = activities[i].poi.location;
                const to = activities[i + 1].poi.location;

                let bestRoute: any = null;
                let bestLeg: any = null;
                let bestMode = '';
                let shortestDuration = Infinity;

                for (const mode of itinerary?.transportModes ?? []) {
                    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=${mode}&key=${apiKey}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log("Response data:", data);

                    if (data.routes && data.routes.length > 0) {
                        const leg = data.routes[0].legs[0];
                        const duration = leg.duration.value;

                        if (duration < shortestDuration) {
                            bestRoute = data.routes[0];
                            bestLeg = leg;
                            bestMode = mode;
                            shortestDuration = duration;
                        }
                    }
                }

                if (bestRoute && bestLeg) {
                    activities[i].routeToNext = {
                        distance: bestLeg.distance.text,
                        duration: bestLeg.duration.text,
                        mode: bestMode,
                        fullRoute: bestRoute, // ruta completa
                    };
                }
            }

            return { ...day, activities };
        }));
        if (itinerary) {
            itinerary.days = updatedDays;
        }
        await itinerary?.save();

        res.status(200).json({ message: 'Rutas actualizadas correctamente', itinerary });
    } catch (error) {
        console.error("Error calculating routes:", error);
        res.status(500).json({ message: "Error calculating routes" });
    }
}