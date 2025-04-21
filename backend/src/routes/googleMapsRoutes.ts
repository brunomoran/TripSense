import express from 'express';
import { geocode, reverseGeocode, getPOIsNearby } from '../controllers/googleMapsController';
import {
    verifyGoogleMapsApiKey,
    validateCoordinates,
    validateSearchText
} from '../middlewares/googleMapsMiddleware';

const router = express.Router();

// Middleware para verificar la clave de API de Google Maps
router.use(verifyGoogleMapsApiKey);

// Rutas específicas de Google Maps
router.post('/geocode', validateSearchText, geocode);
router.post('/reverse-geocode', validateCoordinates, reverseGeocode);
router.post('/pois-nearby', validateCoordinates, getPOIsNearby);

export default router;
