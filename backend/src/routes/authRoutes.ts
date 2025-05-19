import express from "express";
import { register, login, getMe, getUserByUserName, updateUser, followUser, unfollowUser } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import { validateRegister, validateLoginInput, authMiddleware, validateUserUpdate } from "../middlewares/validationMiddleware";

const router = express.Router();

// Rutas de autenticación
router.post("/register", validateRegister, register);
router.post("/login", validateLoginInput, login);
router.get("/me", protect, getMe);
router.get("/user/:userName", getUserByUserName);
router.put("/me", validateUserUpdate, updateUser);
router.post("/users/:userId/follow", authMiddleware, followUser);
router.post("/users/:userId/unfollow", authMiddleware, unfollowUser);

export default router;