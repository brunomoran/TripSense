import express from "express";
import { register, login, getMe, updateUser, followUser, unfollowUser } from "../controllers/authController";
import { validateRegister, validateLoginInput, authMiddleware, validateUserUpdate } from "../middlewares/validationMiddleware";

const router = express.Router();

// Rutas de autenticación
router.post("/register", validateRegister, register);
router.post("/login", validateLoginInput, login);
router.get("/me", getMe);
router.get("/user/:userId", );
router.put("/me", validateUserUpdate, updateUser);
router.post("/users/:userId/follow", authMiddleware, followUser);
router.post("/users/:userId/unfollow", authMiddleware, unfollowUser);

export default router;