import mongoose, { Schema, Document } from "mongoose";
import { POI } from "../types/pointOfInterest";

export interface ItineraryActivity {
    id?: string;
    poi: POI;
    startTime: string;
    endTime: string;
    notes?: string;
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
});

const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
export default Itinerary;