import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PlayersService } from '../services/playersService';

const router = express.Router();
const playersService = new PlayersService();

// POST /api/mcp/analizar-jugador
router.post('/analizar-jugador', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { nombre_jugador } = req.body;
    
    // Validar entrada
    if (!nombre_jugador || typeof nombre_jugador !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Nombre de jugador requerido'
      });
    }

    // Buscar jugador por nombre (usando el servicio existente)
    const resultadoBusqueda = await playersService.searchPlayers(nombre_jugador.trim(), { page: 1, limit: 10 });
    
    if (resultadoBusqueda.players.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado',
        message: `No se encontró ningún jugador con el nombre "${nombre_jugador}"`
      });
    }

    // Tomar el primer resultado (más relevante)
    const jugador = resultadoBusqueda.players[0];
    
    // Obtener datos completos del jugador
    const jugadorCompleto = await playersService.getPlayerById(jugador.id);

    // Formato optimizado para análisis de IA
    const analisisData = {
      jugador: {
        nombre: jugadorCompleto.name,
        posicion: jugadorCompleto.position,
        edad: jugadorCompleto.age,
        equipo: jugadorCompleto.team,
        nacionalidad: jugadorCompleto.nationality
      },
      estadisticas: {
        goles: jugadorCompleto.goals,
        asistencias: jugadorCompleto.assists,
        apariciones: jugadorCompleto.appearances
      },
      atributos: jugadorCompleto.attributes || {},
      contrato: {
        salario_semanal: jugadorCompleto.salary,
        valor_mercado: jugadorCompleto.marketValue,
        fin_contrato: jugadorCompleto.contractEnd
      },
      fisico: {
        altura: jugadorCompleto.height,
        peso: jugadorCompleto.weight
      }
    };

    // Respuesta estructurada para MCP
    res.status(200).json({
      success: true,
      message: `Datos encontrados para ${jugadorCompleto.name}`,
      data: analisisData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error en analizar-jugador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo analizar el jugador'
    });
  }
});

export default router;