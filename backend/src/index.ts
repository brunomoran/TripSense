import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import mapboxRoutes from "./routes/mapboxRoutes";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5001;

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/map", mapboxRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando!");
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});