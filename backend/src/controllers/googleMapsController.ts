import { Request, Response, NextFunction } from 'express';
import { POI } from '../types/pointOfInterest';

const SEARCH_RADIUS_METERS = 50000; // 50 km
const POI_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurantes', emoji: '🍽️' },
  { id: 'lodging', label: 'Hoteles', emoji: '🏨' },
  { id: 'museum', label: 'Museos', emoji: '🏛️' },
  { id: 'tourist_attraction', label: 'Atracciones', emoji: '🎭' },
  { id: 'park', label: 'Parques', emoji: '🌳' },
  { id: 'cafe', label: 'Cafés', emoji: '☕' }
];

export const geocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchText = res.locals.searchText;
    const apiKey = res.locals.googleMapsApiKey;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchText)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      res.status(200).json({
        coordinates: [result.geometry.location.lng, result.geometry.location.lat],
        name: result.address_components[0]?.long_name || 'Lugar',
        placeType: result.types,
        fullName: result.formatted_address
      });
    } else {
      res.status(404).json({ message: 'No se encontraron resultados' });
    }
  } catch (error) {
    console.error('Error en geocode:', error);
    next(error);
  }
};

export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { longitude, latitude } = res.locals.coordinates;
    const apiKey = res.locals.googleMapsApiKey;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      res.status(200).json({
        name: result.address_components[0]?.long_name || 'Ubicación',
        features: data.results.map((r: any) => ({
          name: r.address_components[0]?.long_name || '',
          placeType: r.types,
          fullName: r.formatted_address
        }))
      });
    } else {
      res.status(404).json({ message: 'No se encontraron resultados' });
    }
  } catch (error) {
    console.error('Error en reverseGeocode:', error);
    next(error);
  }
};

const fetchPOIsForCategory = async (
  coordinates: [number, number],
  categoryId: string,
  startId: number,
  apiKey: string
): Promise<POI[]> => {
  try {
    const [lng, lat] = coordinates;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${SEARCH_RADIUS_METERS}&type=${categoryId}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const category = POI_CATEGORIES.find(c => c.id === categoryId);
    const poiLabel = category?.label || 'Punto de interés';
    const poiEmoji = category?.emoji || '📍';

    return (data.results || []).map((place: any, index: number) => ({
      id: startId + index,
      name: `${poiEmoji} ${place.name}`,
      description: place.vicinity || '',
      imageUrl: '',
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      category: poiLabel
    }));
  } catch (error) {
    console.error(`Error al buscar ${categoryId}:`, error);
    return [];
  }
};

export const getPOIsNearby = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { longitude, latitude } = res.locals.coordinates;
    const apiKey = res.locals.googleMapsApiKey;
    const coordinates: [number, number] = [longitude, latitude];

    let allPOIs: POI[] = [];
    let idCounter = 0;

    for (const category of POI_CATEGORIES) {
      const pois = await fetchPOIsForCategory(coordinates, category.id, idCounter, apiKey);
      idCounter += pois.length;
      allPOIs.push(...pois);
    }

    res.status(200).json({ count: allPOIs.length, pois: allPOIs });
  } catch (error) {
    console.error('Error al buscar POIs:', error);
    next(error);
  }
};

export const getPOIsByCity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.body.city || req.query.city;
    if (!city) {
      res.status(400).json({ message: "Falta el nombre de la ciudad" });
    }

    const apiKey = res.locals.googleMapsApiKey;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      res.status(404).json({ message: "Ciudad no encontrada" });
    }

    const location = geocodeData.results[0].geometry.location;
    const coordinates: [number, number] = [location.lng, location.lat];

    let allPOIs: POI[] = [];
    let idCounter = 0;

    for (const category of POI_CATEGORIES) {
      const pois = await fetchPOIsForCategory(coordinates, category.id, idCounter, apiKey);
      idCounter += pois.length;
      allPOIs.push(...pois);
    }

    res.status(200).json({ count: allPOIs.length, pois: allPOIs });
  } catch (error) {
    console.error("Error en getPOIsByCity:", error);
    next(error);
  }
};
