import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Middleware para verificar la existencia de la clave de API de Google Maps
export const verifyGoogleMapsApiKey = (req: Request, res: Response, next: NextFunction) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
        res.status(500).json({ message: "Token de Google Maps no configurado" });
    }

    // Añadir el token a res.locals para que esté disponible en los controladores
    res.locals.googleMapsApiKey = GOOGLE_MAPS_API_KEY;

    next();
}

// Middleware para validar las coordenadas
export const validateCoordinates = (req: Request, res: Response, next: NextFunction) => {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
        res.status(400).json({ message: "Coordenadas no válidas" });
    }

    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lon) || isNaN(lat)) {
        res.status(400).json({ message: "Coordenadas no válidas" });
    }

    if (lon < -180 || lon > 180) {
        res.status(400).json({ message: "Longitud fuera de rango" });
    }

    if (lat < -90 || lat > 90) {
        res.status(400).json({ message: "Latitud fuera de rango" });
    }

    res.locals.coordinates = { longitude: lon, latitude: lat };

    next();
}

// Middleware para validar el texto de búsqueda
export const validateSearchText = (req: Request, res: Response, next: NextFunction) => {
    const { searchText } = req.body;

    if (!searchText || typeof searchText !== 'string' || !searchText.trim()) {
        res.status(400).json({ message: "El texto de búsqueda es obligatorio" });
    }

    res.locals.searchText = searchText.trim();

    next();
};
