import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/reports - Listar reportes
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Endpoint de reportes funcionando',
    data: [],
    note: 'Implementaremos la lógica completa en el día 2'
  });
});

export default router;