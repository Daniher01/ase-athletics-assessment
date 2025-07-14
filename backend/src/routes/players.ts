import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PlayersController } from '../controllers/playersController';

const router: Router = express.Router();

// GET /api/players - Lista de jugadores con filtros y paginación
router.get('/',authenticateToken, PlayersController.getPlayers);

// GET /api/players/search - Búsqueda de jugadores
router.get('/search', authenticateToken, PlayersController.searchPlayers);

// GET /api/players/:id - Detalles de jugador específico
router.get('/:id', authenticateToken, PlayersController.getPlayerById);

// POST /api/players - Crear nuevo jugador
router.post('/', authenticateToken, PlayersController.createPlayer);

// PUT /api/players/:id - Actualizar jugador existente
router.put('/:id', authenticateToken, PlayersController.updatePlayer);

// DELETE /api/players/:id - Eliminar jugador
router.delete('/:id', authenticateToken, PlayersController.deletePlayer);


export default router;