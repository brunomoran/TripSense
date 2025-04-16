import express from 'express';
import { geocode, reverseGeocode, getPOIsNearby } from '../controllers/mapboxController';
import {
    verifyMapboxApiKey,
    validateCoordinates,
    validateSearchText
} from '../middlewares/mapboxMiddleware';

const router = express.Router();

// Middleware para verificar la clave de API de Mapbox
router.use(verifyMapboxApiKey);

// Rutas de mapbox con sus middlewares específicos
router.post('/geocode', validateSearchText, geocode);
router.post('/reverse-geocode', validateCoordinates, reverseGeocode);
router.post('/pois-nearby', validateCoordinates, getPOIsNearby);

export default router;