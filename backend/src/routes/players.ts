import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// GET /api/players - Listar jugadores (requiere autenticación)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Endpoint de jugadores funcionando',
    data: [],
    note: 'Implementaremos la lógica completa en el día 2'
  });
});

export default router;