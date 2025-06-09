import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import googleMapsRoutes from "./routes/googleMapsRoutes";
import itineraryRoutes from "./routes/itineraryRoutes";
import aiRoutes from "./routes/aiRoutes";
import postRoutes from "./routes/postRoutes";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5001;

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/map", googleMapsRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando!");
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});