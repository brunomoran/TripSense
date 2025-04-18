import express from "express";
import { getAllItineraries, getItineraryById, createItinerary, updateItinerary, deleteItinerary } from "../controllers/itineraryController";
import { validateItinerary, checkItineraryExists } from "../middlewares/itineraryMiddleware";

const router = express.Router();

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

export default router;