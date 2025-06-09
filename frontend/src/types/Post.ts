import { Itinerary } from "./Itinerary";

interface UserInfo {
    _id: string;
    userName: string;
    profilePicture?: string;
}

export interface Post {
    _id: string;
    user: UserInfo;
    itinerary: Itinerary;
    description?: string;
    likes: string[];
    createdAt: string;
}