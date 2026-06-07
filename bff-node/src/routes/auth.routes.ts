import { Router } from "express";
import { login, register, logout } from "../controllers/auth.controller";

const router = Router();

/**
 * @route POST /api/auth/register
 * 
 * @desc  Registra un nuevo analista en el sistema
 */
router.post("/register", register);

/**
 * @route POST /api/auth/login
 * @desc  Autentica al usuario y retorna el JWT
 */
router.post("/login", login);

router.post("/logout", logout);

export default router;