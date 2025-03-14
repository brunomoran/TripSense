import express from "express";
import { register, login } from "../controllers/authController";
import { validateRegister, validateLoginInput } from "../middlewares/validationMiddleware";

const router = express.Router();

// Rutas de autenticación
router.post("/register", validateRegister, register);
router.post("/login", validateLoginInput, login);

export default router;