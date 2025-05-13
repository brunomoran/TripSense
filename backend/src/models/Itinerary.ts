import mongoose, { Schema, Document } from "mongoose";
import { POI } from "../types/pointOfInterest";

export interface Route {
    duration: string;
    distance: string;
    mode: string;
    fullRoute?: any; // Ruta completa
}

export interface ItineraryActivity {
    id?: string;
    poi: POI;
    startTime: string;
    endTime: string;
    notes?: string;
    routeToNext?: Route;
}

export interface ItineraryDay {
    id?: string;
    date: string;
    activities: ItineraryActivity[];
}

export interface IItinerary extends Document {
    name: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    userId: string;
    days: ItineraryDay[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt?: Date;
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

const POISchema = new Schema<POI>({
    id: { type: Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    description: String,
    category: String,
    imageUrl: String,
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    address: String,
    externalId: String,
    source: String,
}, { _id: false });

const RouteSchema = new Schema({
    duration: { type: String, required: true },
    distance: { type: String, required: true },
    mode: { type: String, required: true },
    fullRoute: { type: Schema.Types.Mixed }
}, { _id: false });

const ItinerarySchema = new Schema<IItinerary>({
    name: { type: String, required: true },
    description: String,
    destination: String,
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    userId: { type: String, required: true },
    days: [
        {
            id: String,
            date: String,
            activities: [
                {
                    id: { type: String, required: false },
                    poi: POISchema,
                    startTime: String,
                    endTime: String,
                    notes: String,
                },
            ],
        },
    ],
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    transportModes: {
        type: [String],
        default: [],
    },
    completeRoute: {
        totalDistance: String,
        totalDuration: String,
        daysRoutes: [
            {
                date: String,
                totalDistance: String,
                totalDuration: String,
                segments: [RouteSchema],
            },
        ],
    },
});

const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
export default Itinerary;