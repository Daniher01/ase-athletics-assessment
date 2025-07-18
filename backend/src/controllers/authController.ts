// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../types/auth';

// Instancia de servicio
const authService = new AuthService();

export class AuthController {

  // ============= POST /api/auth/register =============
  static async register(req: Request, res: Response) {
    try {
      const registerData: RegisterRequest = req.body;

      // Llamar al servicio (toda tu lógica está ahí)
      const result = await authService.registerUser(registerData);

      // Respuesta exitosa (mismo formato que tenías)
      res.status(201).json({
        message: result.message,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Error en AuthController.register:', error);
      
      // Manejo de errores específicos (mantengo tu lógica)
      if (error.message.includes('requeridos')) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: error.message
        });
      }

      if (error.message.includes('ya existe')) {
        return res.status(409).json({
          error: 'Usuario ya existe',
          message: error.message
        });
      }

      // Error genérico
      res.status(500).json({
        error: 'Error interno',
        message: 'Error al crear el usuario'
      });
    }
  }

  // ============= POST /api/auth/login =============
  static async login(req: Request, res: Response) {
    try {
      const loginData: LoginRequest = req.body;

      // Llamar al servicio (toda tu lógica está ahí)
      const result = await authService.loginUser(loginData);

      // Respuesta exitosa (mismo formato que tenías)
      res.status(200).json({
        message: result.message,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Error en AuthController.login:', error);
      
      // Manejo de errores específicos (mantengo tu lógica)
      if (error.message.includes('requeridos')) {
        return res.status(400).json({
          error: 'Datos faltantes',
          message: error.message
        });
      }

      if (error.message.includes('incorrectos')) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: error.message
        });
      }

      // Error genérico
      res.status(500).json({
        error: 'Error interno',
        message: 'Error al iniciar sesión'
      });
    }
  }

  // ============= GET /api/auth/me  =============
  static async getProfile(req: Request, res: Response) {
    try {
      // El usuario viene del middleware authenticateToken
      if (!req.user) {
        return res.status(401).json({
          error: 'No autenticado',
          message: 'Token de autenticación requerido'
        });
      }

      // Obtener perfil actualizado
      const user = await authService.getUserProfile(req.user.id);

      res.status(200).json({
        message: 'Perfil obtenido exitosamente',
        user: user
      });

    } catch (error: any) {
      console.error('Error en AuthController.getProfile:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'Error interno',
        message: 'Error al obtener el perfil'
      });
    }
  }

  // ============= POST /api/auth/logout =============
  static async logout(req: Request, res: Response) {
    try {
      // En JWT, el logout es principalmente del lado del frontend
      // (eliminar el token del localStorage)
      res.status(200).json({
        message: 'Logout exitoso'
      });
    } catch (error: any) {
      console.error('Error en AuthController.logout:', error);
      res.status(500).json({
        error: 'Error interno',
        message: 'Error al hacer logout'
      });
    }
  }
}