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
            return;
        }

        // Crear copia para trabajar
        const updatedItinerary = JSON.parse(JSON.stringify(itinerary));
        
        // Variables para la ruta completa
        let totalItineraryDistance = 0;
        let totalItineraryDuration = 0;
        const daysRoutes = [];

        // Calcular rutas para cada día
        for (let dayIndex = 0; dayIndex < updatedItinerary.days.length; dayIndex++) {
            const day = updatedItinerary.days[dayIndex];
            const activities = day.activities;
            
            // Variables para el total del día
            let totalDayDistance = 0;
            let totalDayDuration = 0;
            const daySegments = [];

            // Calcular rutas entre actividades
            for (let i = 0; i < activities.length - 1; i++) {
                const from = activities[i].poi.location;
                const to = activities[i + 1].poi.location;

                let bestRoute: any = null;
                let bestLeg: any = null;
                let bestMode = '';
                let shortestDuration = Infinity;

                // Encontrar mejor ruta entre modos de transporte
                for (const mode of updatedItinerary.transportModes || ['transit', 'walking']) {
                    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=${mode}&key=${apiKey}`;
                    
                    const response = await fetch(url);
                    const data = await response.json();

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
                    // Crear objeto de ruta
                    const route = {
                        duration: bestLeg.duration.text,
                        distance: bestLeg.distance.text,
                        mode: bestMode,
                        fullRoute: bestRoute
                    };
                    
                    // Actualizar actividad
                    activities[i].routeToNext = route;
                    
                    // Añadir al total del día
                    totalDayDistance += bestLeg.distance.value;
                    totalDayDuration += bestLeg.duration.value;
                    
                    // Guardar segmento para la ruta del día
                    daySegments.push({
                        from: activities[i].poi.name,
                        to: activities[i + 1].poi.name,
                        ...route
                    });
                    
                    console.log(`Ruta calculada de ${activities[i].poi.name} a ${activities[i + 1].poi.name}: ${bestLeg.duration.text}, ${bestLeg.distance.text}, ${bestMode}`);
                }
            }
            
            // Actualizar totales del día
            day.totalDayRoute = {
                totalDistance: formatDistance(totalDayDistance),
                totalDuration: formatDuration(totalDayDuration),
                segments: daySegments
            };
            
            // Añadir a la ruta completa
            totalItineraryDistance += totalDayDistance;
            totalItineraryDuration += totalDayDuration;
            
            daysRoutes.push({
                date: day.date,
                totalDistance: formatDistance(totalDayDistance),
                totalDuration: formatDuration(totalDayDuration),
                segments: daySegments
            });
        }
        
        // Actualizar ruta completa del itinerario
        updatedItinerary.completeRoute = {
            totalDistance: formatDistance(totalItineraryDistance),
            totalDuration: formatDuration(totalItineraryDuration),
            daysRoutes
        };

        // Actualizar todo el documento
        const result = await Itinerary.findByIdAndUpdate(
            itineraryId, 
            { 
                $set: { 
                    days: updatedItinerary.days,
                    completeRoute: updatedItinerary.completeRoute
                } 
            }, 
            { new: true, runValidators: true }
        );

        if (!result) {
            res.status(500).json({ message: "Failed to update itinerary" });
            return;
        }

        res.status(200).json({ 
            message: 'Rutas actualizadas correctamente', 
            itinerary: result 
        });
    } catch (error) {
        console.error("Error calculating routes:", error);
        res.status(500).json({ message: "Error calculating routes" });
    }
}

// Función para formatear distancia de metros a km legibles
function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

// Función para formatear duración de segundos a formato legible
function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
}