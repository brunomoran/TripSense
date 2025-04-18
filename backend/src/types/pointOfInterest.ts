// Interfaces generales para items en listas
export interface ListItem {
    id: number | string;
    name: string;
    description: string;
    category?: string;
    imageUrl?: string;
    [key: string]: any; // Para permitir propiedades adicionales específicas de cada tipo
}

// Interfaces para puntos de interés (POIs)
export interface POI extends ListItem {
    location: {
        lat: number;
        lng: number;
    };
    address?: string;
    externalId?: string;
    source?: string;
}