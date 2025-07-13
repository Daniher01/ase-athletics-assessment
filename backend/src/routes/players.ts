import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../server';

const router: Router = express.Router();

// Interfaz para query parameters
interface PlayersQuery {
  page?: string;
  limit?: string;
  position?: string;
  team?: string;
  nationality?: string;
  minAge?: string;
  maxAge?: string;
  minMarketValue?: string;
  maxMarketValue?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// GET /api/players - Lista paginada de jugadores con filtros
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      position,
      team,
      nationality,
      minAge,
      maxAge,
      minMarketValue,
      maxMarketValue,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query as PlayersQuery;

    // Convertir a números
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Máximo 50 por página
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros dinámicos
    const where: any = {};

    // Filtro por posición
    if (position) {
      where.position = {
        equals: position,
        mode: 'insensitive'
      };
    }

    // Filtro por equipo
    if (team) {
      where.team = {
        contains: team,
        mode: 'insensitive'
      };
    }

    // Filtro por nacionalidad
    if (nationality) {
      where.nationality = {
        contains: nationality,
        mode: 'insensitive'
      };
    }

    // Filtro por rango de edad
    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge);
      if (maxAge) where.age.lte = parseInt(maxAge);
    }

    // Filtro por valor de mercado
    if (minMarketValue || maxMarketValue) {
      where.marketValue = {};
      if (minMarketValue) where.marketValue.gte = parseInt(minMarketValue);
      if (maxMarketValue) where.marketValue.lte = parseInt(maxMarketValue);
    }

    // Búsqueda por texto (nombre del jugador)
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          team: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Configurar ordenamiento
    const validSortFields = ['name', 'age', 'position', 'team', 'marketValue', 'goals', 'assists'];
    const orderBy: any = {};
    
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.name = 'asc'; // Default
    }

    // Ejecutar consultas
    const [players, totalCount] = await Promise.all([
      prisma.player.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          attributes: true // Incluir atributos del jugador
        }
      }),
      prisma.player.count({ where })
    ]);

    // Calcular metadata de paginación
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Formatear respuesta
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      age: player.age,
      team: player.team,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      preferredFoot: player.preferredFoot,
      jerseyNumber: player.jerseyNumber,
      
      // Estadísticas básicas
      stats: {
        appearances: player.appearances,
        goals: player.goals,
        assists: player.assists,
        yellowCards: player.yellowCards,
        redCards: player.redCards,
        minutesPlayed: player.minutesPlayed
      },
      
      // Estadísticas adicionales
      advancedStats: {
        shotsOnTarget: player.shotsOnTarget,
        totalShots: player.totalShots,
        passAccuracy: player.passAccuracy,
        dribblesCompleted: player.dribblesCompleted,
        tacklesWon: player.tacklesWon,
        aerialDuelsWon: player.aerialDuelsWon
      },
      
      // Información de contrato
      contract: {
        salary: player.salary,
        contractEnd: player.contractEnd,
        marketValue: player.marketValue
      },
      
      // Atributos del jugador
      attributes: player.attributes ? {
        pace: player.attributes.pace,
        shooting: player.attributes.shooting,
        passing: player.attributes.passing,
        dribbling: player.attributes.dribbling,
        defending: player.attributes.defending,
        physical: player.attributes.physical,
        finishing: player.attributes.finishing,
        crossing: player.attributes.crossing,
        longShots: player.attributes.longShots,
        positioning: player.attributes.positioning,
        
        // Atributos de portero (si aplican)
        diving: player.attributes.diving,
        handling: player.attributes.handling,
        kicking: player.attributes.kicking,
        reflexes: player.attributes.reflexes
      } : null,
      
      imageUrl: player.imageUrl,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: `Se encontraron ${totalCount} jugadores`,
      data: formattedPlayers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        position,
        team,
        nationality,
        ageRange: minAge || maxAge ? { min: minAge, max: maxAge } : null,
        marketValueRange: minMarketValue || maxMarketValue ? { min: minMarketValue, max: maxMarketValue } : null,
        search
      },
      sorting: {
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los jugadores'
    });
  }
});

// GET /api/players/:id - Detalles de jugador específico
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);

    if (isNaN(playerId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID del jugador debe ser un número'
      });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        attributes: true,
        scoutReports: {
          include: {
            scout: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Últimos 10 reportes
        }
      }
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado',
        message: `No se encontró un jugador con ID ${playerId}`
      });
    }

    // Formatear respuesta completa
    const playerDetail = {
      id: player.id,
      name: player.name,
      position: player.position,
      age: player.age,
      team: player.team,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      preferredFoot: player.preferredFoot,
      jerseyNumber: player.jerseyNumber,
      
      // Estadísticas completas
      stats: {
        appearances: player.appearances,
        goals: player.goals,
        assists: player.assists,
        yellowCards: player.yellowCards,
        redCards: player.redCards,
        minutesPlayed: player.minutesPlayed,
        saves: player.saves,
        cleanSheets: player.cleanSheets,
        goalsConceded: player.goalsConceded,
        shotsOnTarget: player.shotsOnTarget,
        totalShots: player.totalShots,
        passAccuracy: player.passAccuracy,
        dribblesCompleted: player.dribblesCompleted,
        tacklesWon: player.tacklesWon,
        aerialDuelsWon: player.aerialDuelsWon
      },
      
      // Información de contrato
      contract: {
        salary: player.salary,
        contractEnd: player.contractEnd,
        marketValue: player.marketValue
      },
      
      // Atributos del jugador
      attributes: player.attributes,
      
      // Reportes de scouting recientes
      recentScoutReports: player.scoutReports.map(report => ({
        id: report.id,
        matchDate: report.matchDate,
        competition: report.competition,
        opponent: report.opponent,
        overallRating: report.overallRating,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        recommendation: report.recommendation,
        notes: report.notes,
        scout: report.scout,
        createdAt: report.createdAt
      })),
      
      imageUrl: player.imageUrl,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Jugador encontrado',
      data: playerDetail
    });

  } catch (error) {
    console.error('Error obteniendo jugador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el jugador'
    });
  }
});

export default router;