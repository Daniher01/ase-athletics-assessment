import express, { Request, Response, Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// POST /api/auth/register - Registro de usuario
router.post('/register', AuthController.register);

// POST /api/auth/login - Login de usuario  
router.post('/login', AuthController.login);

// GET /api/auth/me - Obtener perfil del usuario actual
router.get('/me', authenticateToken, AuthController.getProfile);

// POST /api/auth/logout - Logout (opcional, principalmente frontend)
router.post('/logout', authenticateToken, AuthController.logout);


export default router;