import { Request, Response, NextFunction } from 'express';
import { POI } from '../types/pointOfInterest';

const SEARCH_RADIUS = 50000; // 50 km

// Categorias de puntos de interés
const POI_CATEGORIES = [
    { id: 'restaurant', label: 'Restaurantes', emoji: '🍽️' },
    { id: 'hotel', label: 'Hoteles', emoji: '🏨' },
    { id: 'museum', label: 'Museos', emoji: '🏛️' },
    { id: 'attraction', label: 'Atracciones', emoji: '🎭' },
    { id: 'park', label: 'Parques', emoji: '🌳' },
    { id: 'cafe', label: 'Cafés', emoji: '☕' }
]

export const geocode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchText = res.locals.searchText;
        const mapboxApiKey = res.locals.mapboxApiKey;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${mapboxApiKey}&types=place,locality,region`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const result = {
                coordinates: feature.center,
                name: feature.text,
                placeType: feature.place_type,
                fullName: feature.place_name
            };

            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "No se encontraron resultados para la búsqueda" });
        }
    } catch (error) {
        console.error('Error en la geocodificación:', error);
        next(error);
    }
}

export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { longitude, latitude } = res.locals.coordinates;
        const mapboxApiKey = res.locals.mapboxApiKey;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxApiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            // Buscar la característica que sea una ciudad o población
            const cityFeature = data.features.find((f: any) =>
                f.place_type.includes('place') ||
                f.place_type.includes('locality') ||
                f.place_type.includes('region')
            );

            const result = {
                name: cityFeature ? cityFeature.text : 'Ubicación actual',
                features: data.features.map((f: any) => ({
                    name: f.text,
                    placeType: f.place_type,
                    fullName: f.place_name
                }))
            };

            res.status(200).json(result);
        } else {
            res.status(404).json({ message: "No se encontraron resultados para la búsqueda" });
        }
    } catch (error) {
        console.error('Error en la geocodificación inversa:', error);
        next(error);
    }
}

const fetchPOIsForCategory = async (coordinates: [number, number], categoryId: string, startId: number = 0, mapboxApiKey: string) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${categoryId}.json?proximity=${coordinates[0]},${coordinates[1]}&access_token=${mapboxApiKey}&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        return [];
      }
      
      // Filtrar POIs que estén realmente cerca (dentro del radio de búsqueda)
      const category = POI_CATEGORIES.find(c => c.id === categoryId);
      const poiLabel = category ? category.label : 'Punto de interés';
      const poiEmoji = category ? category.emoji : '📍';
      
      const pois = data.features
        .filter((feature: any) => {
          // Calcular distancia aproximada (en grados - una aproximación simple)
          const dx = feature.center[0] - coordinates[0];
          const dy = feature.center[1] - coordinates[1];
          const distanceInDegrees = Math.sqrt(dx * dx + dy * dy);
          
          // Convertir aproximadamente a km (1 grado ≈ 111 km en el ecuador)
          const distanceInKm = distanceInDegrees * 111;
          return distanceInKm <= (SEARCH_RADIUS / 1000);
        })
        .map((feature: any, index: number) => {
          // Extraer dirección del place_name
          const fullAddress = feature.place_name;
          // Quitar el nombre del POI del inicio de la dirección
          const address = fullAddress.replace(feature.text, '').replace(/^,\s*/, '');
          
          return {
            id: startId + index,
            name: `${poiEmoji} ${feature.text}`,
            description: address,
            imageUrl: "", // Podría integrarse con otra API para obtener imágenes
            location: { 
              lat: feature.center[1], 
              lng: feature.center[0] 
            },
            category: poiLabel
          };
        });
      
      return pois;
      
    } catch (error) {
      console.error(`Error al buscar ${categoryId}:`, error);
      return [];
    }
  };
  
  // Buscar todos los puntos de interés cerca de una ubicación
  export const getPOIsNearby = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { longitude, latitude } = res.locals.coordinates;
      const mapboxApiKey = res.locals.mapboxApiKey;
  
      const coordinates: [number, number] = [longitude, latitude];
      
      let allPOIs: POI[] = [];
      let idCounter = 0;
      
      // Buscar POIs para cada categoría
      for (const category of POI_CATEGORIES) {
        const categoryPOIs = await fetchPOIsForCategory(coordinates, category.id, idCounter, mapboxApiKey);
        idCounter += categoryPOIs.length;
        allPOIs = [...allPOIs, ...categoryPOIs];
      }
      
      res.status(200).json({
        count: allPOIs.length,
        pois: allPOIs
      });
    } catch (error) {
      console.error("Error al buscar puntos de interés:", error);
      next(error);
    }
  };