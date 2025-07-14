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

// // ============= REGISTRO DE USUARIO =============
// router.post('/register', async (req: Request, res: Response) => {
//   try {
//     const { email, password, name } = req.body;

//     // Validaciones básicas
//     if (!email || !password || !name) {
//       return res.status(400).json({
//         error: 'Datos faltantes',
//         message: 'Email, contraseña y nombre son requeridos'
//       });
//     }

//     // Verificar si el usuario ya existe
//     const existingUser = await prisma.user.findUnique({
//       where: { email: email.toLowerCase() }
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         error: 'Usuario ya existe',
//         message: 'Ya existe un usuario con este email'
//       });
//     }

//     // Hashear la contraseña
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Crear usuario en la base de datos
//     const newUser = await prisma.user.create({
//       data: {
//         email: email.toLowerCase(),
//         password: hashedPassword,
//         name: name.trim(),
//         role: 'user'
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         createdAt: true
//       }
//     });

//     // Crear JWT token
//     const tokenPayload = {
//       userId: newUser.id,
//       email: newUser.email,
//       role: newUser.role
//     };

//     const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret');

//     res.status(201).json({
//       message: 'Usuario creado exitosamente',
//       user: newUser,
//       token
//     });

//   } catch (error) {
//     console.error('Error en registro:', error);
//     res.status(500).json({
//       error: 'Error interno',
//       message: 'Error al crear el usuario'
//     });
//   }
// });

// // ============= LOGIN DE USUARIO =============
// router.post('/login', async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Validaciones básicas
//     if (!email || !password) {
//       return res.status(400).json({
//         error: 'Datos faltantes',
//         message: 'Email y contraseña son requeridos'
//       });
//     }

//     // Buscar usuario por email
//     const user = await prisma.user.findUnique({
//       where: { email: email.toLowerCase() }
//     });

//     if (!user) {
//       return res.status(401).json({
//         error: 'Credenciales inválidas',
//         message: 'Email o contraseña incorrectos'
//       });
//     }

//     // Verificar contraseña
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         error: 'Credenciales inválidas',
//         message: 'Email o contraseña incorrectos'
//       });
//     }

//     // Crear JWT token
//     const tokenPayload = {
//       userId: user.id,
//       email: user.email,
//       role: user.role
//     };

//     const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret');

//     // Respuesta sin incluir la contraseña
//     const userResponse = {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       createdAt: user.createdAt
//     };

//     res.status(200).json({
//       message: 'Login exitoso',
//       user: userResponse,
//       token
//     });

//   } catch (error) {
//     console.error('Error en login:', error);
//     res.status(500).json({
//       error: 'Error interno',
//       message: 'Error al iniciar sesión'
//     });
//   }
// });

export default router;