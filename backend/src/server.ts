import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth';
import playerRoutes from './routes/players';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';

// Cargar variables de entorno
dotenv.config();

// Inicializar Prisma Client
export const prisma = new PrismaClient();

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Rate limiting - limitar peticiones por IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  }
});

// ============= MIDDLEWARES =============

// Seguridad
app.use(helmet());

// Rate limiting
app.use(limiter);

// CORS - permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compresión de respuestas
app.use(compression());

// Logging de peticiones HTTP
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============= RUTAS =============

// Ruta de health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'ASE Athletics API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Ruta 404 para endpoints no encontrados
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/players',
      'GET /api/reports',
      'POST /api/stats',
    ]
  });
});

// ============= MANEJO DE ERRORES GLOBAL =============

app.use((error: any, req: Request, res: Response, next: any) => {
  console.error('Error global:', error);
  
  // Error de validación de Prisma
  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Datos duplicados',
      message: 'Ya existe un registro con estos datos'
    });
  }
  
  // Error de conexión a base de datos
  if (error.code === 'P1001') {
    return res.status(503).json({
      error: 'Error de conexión',
      message: 'No se puede conectar a la base de datos'
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// ============= INICIAR SERVIDOR =============

async function startServer() {
  try {
    // Probar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejar cierre graceful del servidor
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar la aplicación
startServer();