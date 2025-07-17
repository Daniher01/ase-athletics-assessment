import express, { Request, Response, Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/dashboard/stats - Métricas generales del dashboard
router.get('/stats', authenticateToken, DashboardController.getStats);

// GET /api/dashboard/attributes-by-position
router.get('/stats/position', authenticateToken, DashboardController.getAttributesByPosition);

export default router;