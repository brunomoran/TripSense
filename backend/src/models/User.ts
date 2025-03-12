import { Schema, Document, model } from "mongoose";

// Definición de la interfaz para el modelo User
export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Definición del esquema para el modelo User
const userSchema: Schema = new Schema<IUser>({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Creación del modelo User
const User = model<IUser>("User", userSchema);
export default User;