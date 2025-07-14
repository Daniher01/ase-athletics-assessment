// backend/src/services/authService.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  RegisterRequest, 
  LoginRequest, 
  UserResponse, 
  AuthResponse,
  JWTPayload 
} from '../types/auth';

export class AuthService {
  private get prisma() {
    const { prisma } = require('../server');
    return prisma;
  }

  // ============= REGISTRO DE USUARIO =============
  async registerUser(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const { email, password, name } = data;

      // Validaciones básicas (mantengo tu lógica exacta)
      if (!email || !password || !name) {
        throw new Error('Email, contraseña y nombre son requeridos');
      }

      // Verificar si el usuario ya existe 
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario en la base de datos
      const newUser = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          role: 'user'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      // Crear JWT token
      const tokenPayload: JWTPayload = {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret');

      return {
        message: 'Usuario creado exitosamente',
        user: newUser as UserResponse,
        token
      };

    } catch (error: any) {
      console.error('Error en AuthService.registerUser:', error);
      throw error;
    }
  }

  // ============= LOGIN DE USUARIO =============
  async loginUser(data: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = data;

      // Validaciones básicas 
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Buscar usuario por email 
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Verificar contraseña 
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Email o contraseña incorrectos');
      }

      // Crear JWT token 
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret');

      // Respuesta sin incluir la contraseña 
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };

      return {
        message: 'Login exitoso',
        user: userResponse,
        token
      };

    } catch (error: any) {
      console.error('Error en AuthService.loginUser:', error);
      throw error;
    }
  }

  // ============= OBTENER PERFIL (nuevo endpoint) =============
  async getUserProfile(userId: number): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user as UserResponse;

    } catch (error: any) {
      console.error('Error en AuthService.getUserProfile:', error);
      throw error;
    }
  }
}