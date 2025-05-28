import { Schema, model, Types, Document } from "mongoose";

export interface IPost extends Document {
    user: Types.ObjectId;
    itinerary: Types.ObjectId;
    description?: string;
    createdAt: Date;
    likes: Types.ObjectId[];
}

const postSchema = new Schema<IPost>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itinerary: { type: Schema.Types.ObjectId, ref: "Itinerary", required: true },
    description: { type: String, trim: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

export default model<IPost>("Post", postSchema);
