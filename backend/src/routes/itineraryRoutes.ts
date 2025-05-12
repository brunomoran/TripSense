import express from "express";
import { getAllItineraries, getItineraryById, createItinerary, updateItinerary, deleteItinerary, calculateRoutes } from "../controllers/itineraryController";
import { validateItinerary, checkItineraryExists } from "../middlewares/itineraryMiddleware";
import { verifyGoogleMapsApiKey } from "../middlewares/googleMapsMiddleware";

const router = express.Router();

router.use(verifyGoogleMapsApiKey);

// Get all itineraries
router.get('/user/:userId', getAllItineraries);

// Get itinerary by ID
router.get('/:id', checkItineraryExists, getItineraryById);

// Create new itinerary
router.post('/', validateItinerary, createItinerary);

// Update itinerary
router.put('/:id', checkItineraryExists, validateItinerary, updateItinerary);

// Delete itinerary
router.delete('/:id', checkItineraryExists, deleteItinerary);

// Calculate routes for itinerary
router.post('/:id/calculate', checkItineraryExists, calculateRoutes);

export default router;