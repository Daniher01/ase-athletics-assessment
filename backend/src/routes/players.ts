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

// POST /api/players - Crear nuevo jugador
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      name,
      position,
      age,
      team,
      nationality,
      height,
      weight,
      preferredFoot,
      jerseyNumber,
      
      // Estadísticas básicas (opcionales)
      appearances = 0,
      goals = 0,
      assists = 0,
      yellowCards = 0,
      redCards = 0,
      minutesPlayed = 0,
      
      // Estadísticas específicas para porteros (opcionales)
      saves,
      cleanSheets,
      goalsConceded,
      
      // Estadísticas adicionales (opcionales)
      shotsOnTarget,
      totalShots,
      passAccuracy,
      dribblesCompleted,
      tacklesWon,
      aerialDuelsWon,
      
      // Información de contrato (opcionales)
      salary,
      contractEnd,
      marketValue,
      
      // Atributos del jugador (opcionales)
      attributes
    } = req.body;

    // Validaciones requeridas
    const requiredFields = { name, position, age, team, nationality, height, weight };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos faltantes',
        message: `Los siguientes campos son requeridos: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validaciones de tipo y rango
    if (typeof age !== 'number' || age < 16 || age > 45) {
      return res.status(400).json({
        success: false,
        error: 'Edad inválida',
        message: 'La edad debe ser un número entre 16 y 45 años'
      });
    }

    if (typeof height !== 'number' || height < 150 || height > 220) {
      return res.status(400).json({
        success: false,
        error: 'Altura inválida',
        message: 'La altura debe ser un número entre 150 y 220 cm'
      });
    }

    if (typeof weight !== 'number' || weight < 50 || weight > 120) {
      return res.status(400).json({
        success: false,
        error: 'Peso inválido',
        message: 'El peso debe ser un número entre 50 y 120 kg'
      });
    }

    // Validar posición
    const validPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
    if (!validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        error: 'Posición inválida',
        message: `La posición debe ser una de: ${validPositions.join(', ')}`
      });
    }

    // Validar pie preferido
    const validFeet = ['Left', 'Right', 'Both'];
    if (preferredFoot && !validFeet.includes(preferredFoot)) {
      return res.status(400).json({
        success: false,
        error: 'Pie preferido inválido',
        message: `El pie preferido debe ser uno de: ${validFeet.join(', ')}`
      });
    }

    // Validar número de camiseta único en el equipo (si se proporciona)
    if (jerseyNumber !== null && jerseyNumber !== undefined) {
      const existingPlayerWithJersey = await prisma.player.findFirst({
        where: {
          team: {
            equals: team,
            mode: 'insensitive'
          },
          jerseyNumber: jerseyNumber
        }
      });

      if (existingPlayerWithJersey) {
        return res.status(400).json({
          success: false,
          error: 'Número de camiseta duplicado',
          message: `Ya existe un jugador con el número ${jerseyNumber} en ${team}`
        });
      }
    }

    // Generar ID único
    const maxPlayer = await prisma.player.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const newId = (maxPlayer?.id || 0) + 1;

    // Crear jugador
    const newPlayer = await prisma.player.create({
      data: {
        id: newId,
        name: name.trim(),
        position,
        age,
        team: team.trim(),
        nationality: nationality.trim(),
        height,
        weight,
        preferredFoot: preferredFoot || 'Right',
        jerseyNumber,
        
        // Estadísticas básicas
        appearances,
        goals,
        assists,
        yellowCards,
        redCards,
        minutesPlayed,
        
        // Estadísticas específicas para porteros
        saves,
        cleanSheets,
        goalsConceded,
        
        // Estadísticas adicionales
        shotsOnTarget,
        totalShots,
        passAccuracy,
        dribblesCompleted,
        tacklesWon,
        aerialDuelsWon,
        
        // Información de contrato
        salary,
        contractEnd,
        marketValue,
        
        // URL de imagen (generar desde nombre)
        imageUrl: name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
      }
    });

    // Crear atributos del jugador si se proporcionan
    let playerAttributes = null;
    if (attributes) {
      // Validar que los atributos estén en rango válido (1-100)
      const validAttributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
      const invalidAttributes = validAttributes.filter(attr => {
        const value = attributes[attr];
        return value !== undefined && (typeof value !== 'number' || value < 1 || value > 100);
      });

      if (invalidAttributes.length > 0) {
        // Eliminar el jugador creado si los atributos son inválidos
        await prisma.player.delete({ where: { id: newId } });
        
        return res.status(400).json({
          success: false,
          error: 'Atributos inválidos',
          message: `Los atributos deben estar entre 1 y 100: ${invalidAttributes.join(', ')}`
        });
      }

      playerAttributes = await prisma.playerAttributes.create({
        data: {
          playerId: newId,
          pace: attributes.pace || 50,
          shooting: attributes.shooting || 50,
          passing: attributes.passing || 50,
          dribbling: attributes.dribbling || 50,
          defending: attributes.defending || 50,
          physical: attributes.physical || 50,
          finishing: attributes.finishing,
          crossing: attributes.crossing,
          longShots: attributes.longShots,
          positioning: attributes.positioning,
          
          // Atributos específicos de portero
          diving: attributes.diving,
          handling: attributes.handling,
          kicking: attributes.kicking,
          reflexes: attributes.reflexes
        }
      });
    }

    // Respuesta exitosa con jugador completo
    res.status(201).json({
      success: true,
      message: 'Jugador creado exitosamente',
      data: {
        id: newPlayer.id,
        name: newPlayer.name,
        position: newPlayer.position,
        age: newPlayer.age,
        team: newPlayer.team,
        nationality: newPlayer.nationality,
        height: newPlayer.height,
        weight: newPlayer.weight,
        preferredFoot: newPlayer.preferredFoot,
        jerseyNumber: newPlayer.jerseyNumber,
        
        stats: {
          appearances: newPlayer.appearances,
          goals: newPlayer.goals,
          assists: newPlayer.assists,
          yellowCards: newPlayer.yellowCards,
          redCards: newPlayer.redCards,
          minutesPlayed: newPlayer.minutesPlayed
        },
        
        contract: {
          salary: newPlayer.salary,
          contractEnd: newPlayer.contractEnd,
          marketValue: newPlayer.marketValue
        },
        
        attributes: playerAttributes,
        imageUrl: newPlayer.imageUrl,
        createdAt: newPlayer.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error creando jugador:', error);
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Datos duplicados',
        message: 'Ya existe un jugador con estos datos únicos'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo crear el jugador'
    });
  }
});

// PUT /api/players/:id - Actualizar jugador existente
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);

    if (isNaN(playerId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID del jugador debe ser un número'
      });
    }

    // Verificar que el jugador existe
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      include: { attributes: true }
    });

    if (!existingPlayer) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado',
        message: `No se encontró un jugador con ID ${playerId}`
      });
    }

    const {
      name,
      position,
      age,
      team,
      nationality,
      height,
      weight,
      preferredFoot,
      jerseyNumber,
      
      // Estadísticas básicas
      appearances,
      goals,
      assists,
      yellowCards,
      redCards,
      minutesPlayed,
      
      // Estadísticas específicas para porteros
      saves,
      cleanSheets,
      goalsConceded,
      
      // Estadísticas adicionales
      shotsOnTarget,
      totalShots,
      passAccuracy,
      dribblesCompleted,
      tacklesWon,
      aerialDuelsWon,
      
      // Información de contrato
      salary,
      contractEnd,
      marketValue,
      
      // Atributos del jugador
      attributes
    } = req.body;

    // Validaciones solo para campos que se están actualizando
    if (age !== undefined && (typeof age !== 'number' || age < 16 || age > 45)) {
      return res.status(400).json({
        success: false,
        error: 'Edad inválida',
        message: 'La edad debe ser un número entre 16 y 45 años'
      });
    }

    if (height !== undefined && (typeof height !== 'number' || height < 150 || height > 220)) {
      return res.status(400).json({
        success: false,
        error: 'Altura inválida',
        message: 'La altura debe ser un número entre 150 y 220 cm'
      });
    }

    if (weight !== undefined && (typeof weight !== 'number' || weight < 50 || weight > 120)) {
      return res.status(400).json({
        success: false,
        error: 'Peso inválido',
        message: 'El peso debe ser un número entre 50 y 120 kg'
      });
    }

    // Validar posición si se está actualizando
    if (position !== undefined) {
      const validPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
      if (!validPositions.includes(position)) {
        return res.status(400).json({
          success: false,
          error: 'Posición inválida',
          message: `La posición debe ser una de: ${validPositions.join(', ')}`
        });
      }
    }

    // Validar pie preferido si se está actualizando
    if (preferredFoot !== undefined) {
      const validFeet = ['Left', 'Right', 'Both'];
      if (!validFeet.includes(preferredFoot)) {
        return res.status(400).json({
          success: false,
          error: 'Pie preferido inválido',
          message: `El pie preferido debe ser uno de: ${validFeet.join(', ')}`
        });
      }
    }

    // Validar número de camiseta único en el equipo (si se está cambiando)
    if (jerseyNumber !== undefined && jerseyNumber !== existingPlayer.jerseyNumber) {
      const teamToCheck = team || existingPlayer.team;
      const existingPlayerWithJersey = await prisma.player.findFirst({
        where: {
          team: {
            equals: teamToCheck,
            mode: 'insensitive'
          },
          jerseyNumber: jerseyNumber,
          id: {
            not: playerId // Excluir el jugador actual
          }
        }
      });

      if (existingPlayerWithJersey) {
        return res.status(400).json({
          success: false,
          error: 'Número de camiseta duplicado',
          message: `Ya existe otro jugador con el número ${jerseyNumber} en ${teamToCheck}`
        });
      }
    }

    // Preparar datos para actualización (solo campos proporcionados)
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (position !== undefined) updateData.position = position;
    if (age !== undefined) updateData.age = age;
    if (team !== undefined) updateData.team = team.trim();
    if (nationality !== undefined) updateData.nationality = nationality.trim();
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (preferredFoot !== undefined) updateData.preferredFoot = preferredFoot;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    
    // Estadísticas básicas
    if (appearances !== undefined) updateData.appearances = appearances;
    if (goals !== undefined) updateData.goals = goals;
    if (assists !== undefined) updateData.assists = assists;
    if (yellowCards !== undefined) updateData.yellowCards = yellowCards;
    if (redCards !== undefined) updateData.redCards = redCards;
    if (minutesPlayed !== undefined) updateData.minutesPlayed = minutesPlayed;
    
    // Estadísticas específicas para porteros
    if (saves !== undefined) updateData.saves = saves;
    if (cleanSheets !== undefined) updateData.cleanSheets = cleanSheets;
    if (goalsConceded !== undefined) updateData.goalsConceded = goalsConceded;
    
    // Estadísticas adicionales
    if (shotsOnTarget !== undefined) updateData.shotsOnTarget = shotsOnTarget;
    if (totalShots !== undefined) updateData.totalShots = totalShots;
    if (passAccuracy !== undefined) updateData.passAccuracy = passAccuracy;
    if (dribblesCompleted !== undefined) updateData.dribblesCompleted = dribblesCompleted;
    if (tacklesWon !== undefined) updateData.tacklesWon = tacklesWon;
    if (aerialDuelsWon !== undefined) updateData.aerialDuelsWon = aerialDuelsWon;
    
    // Información de contrato
    if (salary !== undefined) updateData.salary = salary;
    if (contractEnd !== undefined) updateData.contractEnd = contractEnd;
    if (marketValue !== undefined) updateData.marketValue = marketValue;

    // Actualizar imagen si cambió el nombre
    if (name !== undefined) {
      updateData.imageUrl = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Actualizar jugador
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: updateData
    });

    // Manejar actualización de atributos si se proporcionan
    let updatedAttributes = existingPlayer.attributes;
    if (attributes !== undefined) {
      // Validar que los atributos estén en rango válido (1-100)
      const validAttributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
      const invalidAttributes = validAttributes.filter(attr => {
        const value = attributes[attr];
        return value !== undefined && (typeof value !== 'number' || value < 1 || value > 100);
      });

      if (invalidAttributes.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Atributos inválidos',
          message: `Los atributos deben estar entre 1 y 100: ${invalidAttributes.join(', ')}`
        });
      }

      // Preparar datos de atributos para actualización
      const attributesUpdateData: any = {};
      
      if (attributes.pace !== undefined) attributesUpdateData.pace = attributes.pace;
      if (attributes.shooting !== undefined) attributesUpdateData.shooting = attributes.shooting;
      if (attributes.passing !== undefined) attributesUpdateData.passing = attributes.passing;
      if (attributes.dribbling !== undefined) attributesUpdateData.dribbling = attributes.dribbling;
      if (attributes.defending !== undefined) attributesUpdateData.defending = attributes.defending;
      if (attributes.physical !== undefined) attributesUpdateData.physical = attributes.physical;
      if (attributes.finishing !== undefined) attributesUpdateData.finishing = attributes.finishing;
      if (attributes.crossing !== undefined) attributesUpdateData.crossing = attributes.crossing;
      if (attributes.longShots !== undefined) attributesUpdateData.longShots = attributes.longShots;
      if (attributes.positioning !== undefined) attributesUpdateData.positioning = attributes.positioning;
      
      // Atributos específicos de portero
      if (attributes.diving !== undefined) attributesUpdateData.diving = attributes.diving;
      if (attributes.handling !== undefined) attributesUpdateData.handling = attributes.handling;
      if (attributes.kicking !== undefined) attributesUpdateData.kicking = attributes.kicking;
      if (attributes.reflexes !== undefined) attributesUpdateData.reflexes = attributes.reflexes;

      if (existingPlayer.attributes) {
        // Actualizar atributos existentes
        updatedAttributes = await prisma.playerAttributes.update({
          where: { playerId: playerId },
          data: attributesUpdateData
        });
      } else {
        // Crear atributos si no existían
        updatedAttributes = await prisma.playerAttributes.create({
          data: {
            playerId: playerId,
            pace: attributes.pace || 50,
            shooting: attributes.shooting || 50,
            passing: attributes.passing || 50,
            dribbling: attributes.dribbling || 50,
            defending: attributes.defending || 50,
            physical: attributes.physical || 50,
            finishing: attributes.finishing,
            crossing: attributes.crossing,
            longShots: attributes.longShots,
            positioning: attributes.positioning,
            diving: attributes.diving,
            handling: attributes.handling,
            kicking: attributes.kicking,
            reflexes: attributes.reflexes
          }
        });
      }
    }

    // Respuesta exitosa con jugador actualizado
    res.status(200).json({
      success: true,
      message: 'Jugador actualizado exitosamente',
      data: {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        position: updatedPlayer.position,
        age: updatedPlayer.age,
        team: updatedPlayer.team,
        nationality: updatedPlayer.nationality,
        height: updatedPlayer.height,
        weight: updatedPlayer.weight,
        preferredFoot: updatedPlayer.preferredFoot,
        jerseyNumber: updatedPlayer.jerseyNumber,
        
        stats: {
          appearances: updatedPlayer.appearances,
          goals: updatedPlayer.goals,
          assists: updatedPlayer.assists,
          yellowCards: updatedPlayer.yellowCards,
          redCards: updatedPlayer.redCards,
          minutesPlayed: updatedPlayer.minutesPlayed
        },
        
        contract: {
          salary: updatedPlayer.salary,
          contractEnd: updatedPlayer.contractEnd,
          marketValue: updatedPlayer.marketValue
        },
        
        attributes: updatedAttributes,
        imageUrl: updatedPlayer.imageUrl,
        updatedAt: updatedPlayer.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Error actualizando jugador:', error);
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Datos duplicados',
        message: 'Ya existe un jugador con estos datos únicos'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el jugador'
    });
  }
});

export default router;