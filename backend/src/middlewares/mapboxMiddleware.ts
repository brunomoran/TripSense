import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Middleware para verificar la existencia de la clave de API de Mapbox
export const verifyMapboxApiKey = (req: Request, res: Response, next: NextFunction) => {
    const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

    if (!MAPBOX_API_KEY) {
        return res.status(500).json({ message: "Token de Mapbox no configurado" });
    }

    // Añadir el token a res.locals para que esté disponible en los controladores
    res.locals.mapboxApiKey = MAPBOX_API_KEY;

    next();
}

// Middleware para validar las coordenadas
export const validateCoordinates = (req: Request, res: Response, next: NextFunction) => {
    const { longitude, latitude } = req.body;

    // Validar que las coordenadas existan
    if (!longitude || !latitude) {
        return res.status(400).json({ message: "Coordenadas no válidas" });
    }

    // Convertir las coordenadas a números y validar que estén dentro de los rangos válidos
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(lon) || isNaN(lat)) {
        return res.status(400).json({ message: "Coordenadas no válidas" });
    }

    if (lon < -180 || lon > 180) {
        return res.status(400).json({ message: "Longitud fuera de rango" });
    }

    if (lat < -90 || lat > 90) {
        return res.status(400).json({ message: "Latitud fuera de rango" });
    }

    // Añadir las coordenadas a res.locals para que estén disponibles en los controladores
    res.locals.coordinates = { longitude: lon, latitude: lat };

    next();
}

// Middleware para validar el texto de búsqueda
export const validateSearchText = (req: Request, res: Response, next: NextFunction) => {
    const { searchText } = req.body;

    if (!searchText || typeof searchText !== 'string' || !searchText.trim()) {
        return res.status(400).json({ message: "El texto de búsqueda es obligatorio" });
    }

    // Sanitizamos el texto de búsqueda
    res.locals.searchText = searchText.trim();

    next();
};