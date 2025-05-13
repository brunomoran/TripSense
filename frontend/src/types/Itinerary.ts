import { POI } from './ListItem';

export interface Route {
    duration: string;
    distance: string;
    mode: string;
    fullRoute?: any; // Ruta completa
}

export interface Itinerary {
    _id: string;
    name: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    userId: string;
    days: ItineraryDay[];
    isPublic: boolean;
    createdAt?: string;
    updatedAt?: string;
    transportModes: string[];
    completeRoute?: {
        totalDistance: string;
        totalDuration: string;
        daysRoutes: Array<{
            date: string;
            totalDistance: string;
            totalDuration: string;
            segments: Route[];
        }>;
    }
}

export interface ItineraryDay {
    _id?: string;
    id?: string;
    date: string;
    activities: ItineraryActivity[];
}

export interface ItineraryActivity {
    _id?: string;
    id?: string;
    poi: POI;
    startTime: string;
    endTime: string;
    notes?: string;
    routeToNext?: Route;
}

export interface ItineraryResponse {
    itinerary: Itinerary;
    message: string;
}

export interface ItinerariesResponse {
    itineraries: Itinerary[];
    count: number;
}