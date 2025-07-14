import express, { Request, Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../server';

const router: Router = express.Router();

// GET /api/dashboard/stats - Métricas generales del dashboard
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    // 1. Estadísticas generales básicas
    const [
      totalPlayers,
      totalReports,
      totalUsers,
      avgAge,
      avgMarketValue
    ] = await Promise.all([
      prisma.player.count(),
      prisma.scoutReport.count(),
      prisma.user.count(),
      prisma.player.aggregate({
        _avg: { age: true }
      }),
      prisma.player.aggregate({
        _avg: { marketValue: true },
        where: { marketValue: { not: null } }
      })
    ]);

    // 2. Distribución por posiciones
    const positionStats = await prisma.player.groupBy({
      by: ['position'],
      _count: { position: true },
      _avg: { 
        age: true,
        goals: true,
        assists: true,
        marketValue: true
      },
      orderBy: { _count: { position: 'desc' } }
    });

    // 3. Top equipos con más jugadores
    const teamStats = await prisma.player.groupBy({
      by: ['team'],
      _count: { team: true },
      _avg: { 
        age: true,
        marketValue: true
      },
      orderBy: { _count: { team: 'desc' } },
      take: 10
    });

    // 4. Distribución por nacionalidades (top 10)
    const nationalityStats = await prisma.player.groupBy({
      by: ['nationality'],
      _count: { nationality: true },
      orderBy: { _count: { nationality: 'desc' } },
      take: 10
    });

    // 5. Jugadores top por estadísticas
    const [topScorers, topAssisters, topValuable] = await Promise.all([
      prisma.player.findMany({
        select: {
          id: true,
          name: true,
          team: true,
          position: true,
          goals: true
        },
        orderBy: { goals: 'desc' },
        take: 10
      }),
      prisma.player.findMany({
        select: {
          id: true,
          name: true,
          team: true,
          position: true,
          assists: true
        },
        orderBy: { assists: 'desc' },
        take: 10
      }),
      prisma.player.findMany({
        select: {
          id: true,
          name: true,
          team: true,
          position: true,
          marketValue: true
        },
        where: { marketValue: { not: null } },
        orderBy: { marketValue: 'desc' },
        take: 10
      })
    ]);

    // 6. Estadísticas de edad
    const ageDistribution = await prisma.player.groupBy({
      by: ['age'],
      _count: { age: true },
      orderBy: { age: 'asc' }
    });

    // Agrupar por rangos de edad
    const ageRanges = {
      '16-20': 0,
      '21-25': 0,
      '26-30': 0,
      '31-35': 0,
      '36+': 0
    };

    ageDistribution.forEach(item => {
      const age = item.age;
      const count = item._count.age;
      
      if (age <= 20) ageRanges['16-20'] += count;
      else if (age <= 25) ageRanges['21-25'] += count;
      else if (age <= 30) ageRanges['26-30'] += count;
      else if (age <= 35) ageRanges['31-35'] += count;
      else ageRanges['36+'] += count;
    });

    // 7. Estadísticas de valor de mercado
    const marketValueStats = await prisma.player.aggregate({
      _min: { marketValue: true },
      _max: { marketValue: true },
      _sum: { marketValue: true },
      where: { marketValue: { not: null } }
    });

    // 8. Promedios por posición (atributos)
    const attributesByPosition = await prisma.player.findMany({
      select: {
        position: true,
        attributes: {
          select: {
            pace: true,
            shooting: true,
            passing: true,
            dribbling: true,
            defending: true,
            physical: true
          }
        }
      },
      where: {
        attributes: { isNot: null }
      }
    });

    // Calcular promedios de atributos por posición
    const positionAttributes: any = {};
    
    attributesByPosition.forEach(player => {
      if (!player.attributes) return;
      
      if (!positionAttributes[player.position]) {
        positionAttributes[player.position] = {
          count: 0,
          pace: 0,
          shooting: 0,
          passing: 0,
          dribbling: 0,
          defending: 0,
          physical: 0
        };
      }
      
      const pos = positionAttributes[player.position];
      pos.count++;
      pos.pace += player.attributes.pace;
      pos.shooting += player.attributes.shooting;
      pos.passing += player.attributes.passing;
      pos.dribbling += player.attributes.dribbling;
      pos.defending += player.attributes.defending;
      pos.physical += player.attributes.physical;
    });

    // Calcular promedios finales
    Object.keys(positionAttributes).forEach(position => {
      const pos = positionAttributes[position];
      const count = pos.count;
      
      positionAttributes[position] = {
        pace: Math.round(pos.pace / count),
        shooting: Math.round(pos.shooting / count),
        passing: Math.round(pos.passing / count),
        dribbling: Math.round(pos.dribbling / count),
        defending: Math.round(pos.defending / count),
        physical: Math.round(pos.physical / count)
      };
    });

    // 9. Contratos próximos a vencer (próximos 12 meses)
    const currentDate = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(currentDate.getFullYear() + 1);

    const contractsExpiring = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        team: true,
        position: true,
        contractEnd: true,
        marketValue: true
      },
      where: {
        contractEnd: {
          not: null,
          lte: nextYear.toISOString().split('T')[0]
        }
      },
      orderBy: { contractEnd: 'asc' },
      take: 20
    });

    // Formatear respuesta final
    res.status(200).json({
      success: true,
      message: 'Estadísticas del dashboard obtenidas exitosamente',
      data: {
        // Resumen general
        overview: {
          totalPlayers,
          totalReports,
          totalUsers,
          averageAge: Math.round(avgAge._avg.age || 0),
          averageMarketValue: Math.round(avgMarketValue._avg.marketValue || 0)
        },

        // Distribuciones
        distributions: {
          byPosition: positionStats.map(pos => ({
            position: pos.position,
            count: pos._count.position,
            averageAge: Math.round(pos._avg.age || 0),
            averageGoals: Math.round(pos._avg.goals || 0),
            averageAssists: Math.round(pos._avg.assists || 0),
            averageMarketValue: Math.round(pos._avg.marketValue || 0)
          })),
          
          byTeam: teamStats.map(team => ({
            team: team.team,
            playerCount: team._count.team,
            averageAge: Math.round(team._avg.age || 0),
            averageMarketValue: Math.round(team._avg.marketValue || 0)
          })),
          
          byNationality: nationalityStats.map(nat => ({
            nationality: nat.nationality,
            playerCount: nat._count.nationality
          })),
          
          byAgeRange: ageRanges
        },

        // Top jugadores
        topPlayers: {
          topScorers: topScorers.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            position: p.position,
            goals: p.goals
          })),
          
          topAssisters: topAssisters.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            position: p.position,
            assists: p.assists
          })),
          
          mostValuable: topValuable.map(p => ({
            id: p.id,
            name: p.name,
            team: p.team,
            position: p.position,
            marketValue: p.marketValue
          }))
        },

        // Análisis de mercado
        marketAnalysis: {
          totalMarketValue: marketValueStats._sum.marketValue || 0,
          minimumValue: marketValueStats._min.marketValue || 0,
          maximumValue: marketValueStats._max.marketValue || 0,
          contractsExpiring: contractsExpiring.length,
          expiringContracts: contractsExpiring
        },

        // Atributos por posición
        attributesByPosition,

        // Metadata
        generatedAt: new Date().toISOString(),
        dataVersion: '1.0'
      }
    });

  } catch (error: any) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas del dashboard'
    });
  }
});

export default router;