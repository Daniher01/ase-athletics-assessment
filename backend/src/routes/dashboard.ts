import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/dashboard/stats - Estadísticas del dashboard
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Endpoint de dashboard funcionando',
    stats: {
      totalPlayers: 0,
      totalReports: 0
    },
    note: 'Implementaremos la lógica completa en el día 2'
  });
});

export default router;