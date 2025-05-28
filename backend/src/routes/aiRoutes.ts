import express from 'express';
import { generateItinerary } from '../controllers/aiController';

const router = express.Router();

// Ruta para generar itinerario
router.post('/generate-itinerary', generateItinerary);

export default router;