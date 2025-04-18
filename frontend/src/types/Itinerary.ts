import { POI } from './ListItem';

export interface Itinerary {
    id: string;
    name: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    userId: string;
    days: ItineraryDay[];
    isPublic: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ItineraryDay {
    id: string;
    date: string;
    activities: ItineraryActivity[];
}

export interface ItineraryActivity {
    id: string;
    poi: POI;
    startTime: string;
    endTime: string;
    notes?: string;
}