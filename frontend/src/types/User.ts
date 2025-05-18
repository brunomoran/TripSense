export interface ProfileUser {
    _id: string;
    userName: string;
    email?: string;
    profilePicture?: string;
    bio?: string;
    followers: string[];
    following: string[];
    createdAt: Date;
}