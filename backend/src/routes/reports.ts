// backend/src/routes/reports.ts
import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ReportsController } from '../controllers/reportsController';

const router: Router = express.Router();

// GET /api/reports - Lista de reportes con filtros y paginación
router.get('/', authenticateToken, ReportsController.getReports);

// GET /api/reports/:id - Detalles de reporte específico
router.get('/:id', authenticateToken, ReportsController.getReportById);

// POST /api/reports - Crear nuevo reporte
router.post('/', authenticateToken, ReportsController.createReport);

// PUT /api/reports/:id - Actualizar reporte existente
router.put('/:id', authenticateToken, ReportsController.updateReport);

// DELETE /api/reports/:id - Eliminar reporte
router.delete('/:id', authenticateToken, ReportsController.deleteReport);

export default router;