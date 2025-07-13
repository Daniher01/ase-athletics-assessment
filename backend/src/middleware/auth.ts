import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

// Interfaz para el payload del JWT
interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// ============= MIDDLEWARE DE AUTENTICACIÓN =============
export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Verificar que existe el header Authorization
    if (!authHeader) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Token de autorización requerido'
      });
    }

    // Verificar formato Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Formato de token inválido',
        message: 'El token debe empezar con "Bearer "'
      });
    }

    // Extraer el token
    const token = authHeader.substring(7);

    // Verificar JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El token no corresponde a un usuario válido'
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();

  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token no es válido'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, inicia sesión nuevamente'
      });
    }

    res.status(500).json({
      error: 'Error interno',
      message: 'Error al verificar autenticación'
    });
  }
};

// ============= MIDDLEWARE PARA VERIFICAR ROLES =============
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere uno de estos roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// ============= MIDDLEWARE OPCIONAL (permite acceso sin token) =============
export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si no hay token, continuar sin usuario
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    // Intentar verificar el token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (user) {
      req.user = user;
    }

    next();

  } catch (error) {
    // Si hay error con el token, continuar sin usuario
    next();
  }
};