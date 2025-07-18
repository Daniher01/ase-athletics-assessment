// backend/src/services/dashboardService.ts

import { 
  BasicStats,
  PositionStats,
  TeamStats,
  NationalityStats,
  TopPlayers,
  AgeRanges,
  MarketAnalysis,
  PositionAttributes,
  DashboardStatsResponse,
  AttributesByPositionItem
} from '../types/dashboard';

export class DashboardService {
  private get prisma() {
    const { prisma } = require('../server');
    return prisma;
  }

  // ============= OBTENER TODAS LAS ESTADÍSTICAS DEL DASHBOARD =============
  async getDashboardStats(): Promise<DashboardStatsResponse['data']> {
    try {
        
      // 1. Estadísticas generales básicas
      const [
        totalPlayers,
        totalReports,
        totalUsers,
        avgAge,
        avgMarketValue
      ] = await Promise.all([
        this.prisma.player.count(),
        this.prisma.scoutReport.count(),
        this.prisma.user.count(),
        this.prisma.player.aggregate({
          _avg: { age: true }
        }),
        this.prisma.player.aggregate({
          _avg: { marketValue: true },
          where: { marketValue: { not: null } }
        })
      ]);

      // 2. Distribución por posiciones
      const positionStats = await this.prisma.player.groupBy({
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
      const teamStats = await this.prisma.player.groupBy({
        by: ['team'],
        _count: { team: true },
        _avg: { 
          age: true,
          marketValue: true
        },
        orderBy: { _count: { team: 'desc' } },
        take: 10
      });

      // 4. Distribución por nacionalidades 
      const nationalityStats = await this.prisma.player.groupBy({
        by: ['nationality'],
        _count: { nationality: true },
        orderBy: { _count: { nationality: 'desc' } },
        take: 10
      });

      // 5. Jugadores top por estadísticas 
      const [topScorers, topAssisters, topValuable] = await Promise.all([
        this.prisma.player.findMany({
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
        this.prisma.player.findMany({
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
        this.prisma.player.findMany({
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
      const ageDistribution = await this.prisma.player.groupBy({
        by: ['age'],
        _count: { age: true },
        orderBy: { age: 'asc' }
      });

      // Agrupar por rangos de edad 
      const ageRanges: AgeRanges = {
        '16-20': 0,
        '21-25': 0,
        '26-30': 0,
        '31-35': 0,
        '36+': 0
      };

      ageDistribution.forEach((item: any) => {
        const age = item.age;
        const count = item._count.age;
        
        if (age <= 20) ageRanges['16-20'] += count;
        else if (age <= 25) ageRanges['21-25'] += count;
        else if (age <= 30) ageRanges['26-30'] += count;
        else if (age <= 35) ageRanges['31-35'] += count;
        else ageRanges['36+'] += count;
      });

      // 7. Estadísticas de valor de mercado 
      const marketValueStats = await this.prisma.player.aggregate({
        _min: { marketValue: true },
        _max: { marketValue: true },
        _sum: { marketValue: true },
        where: { marketValue: { not: null } }
      });

      // 8. Contratos próximos a expirar
      const contractsExpiring = await this.prisma.player.findMany({
        where: {
          contractEnd: {
            lte: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
          }
        },
        select: {
          id: true,
          name: true,
          team: true,
          contractEnd: true
        },
        take: 10
      });

      // 9. Promedios por posición (atributos)
      const attributesByPosition = await this.prisma.player.findMany({
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
      
      attributesByPosition.forEach((player: any) => {
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

      // Formatear respuesta final
      return {
        basicStats: {
          totalPlayers,
          totalReports,
          totalUsers,
          avgAge: avgAge._avg.age || 0,
          avgMarketValue: avgMarketValue._avg.marketValue || 0
        },

        positionDistribution: positionStats.map((stat: any) => ({
          position: stat.position,
          count: stat._count.position,
          avgAge: stat._avg.age || 0,
          avgGoals: stat._avg.goals || 0,
          avgAssists: stat._avg.assists || 0,
          avgMarketValue: stat._avg.marketValue || 0
        })),

        teamDistribution: teamStats.map((stat: any) => ({
          team: stat.team,
          count: stat._count.team,
          avgAge: stat._avg.age || 0,
          avgMarketValue: stat._avg.marketValue || 0
        })),

        nationalityDistribution: nationalityStats.map((stat: any) => ({
          nationality: stat.nationality,
          count: stat._count.nationality
        })),

        ageDistribution: ageRanges,

        topPlayers: {
          topScorers: topScorers.map((p: any) => ({
            id: p.id,
            name: p.name,
            team: p.team,
            position: p.position,
            goals: p.goals
          })),
          
          topAssisters: topAssisters.map((p: any) => ({
            id: p.id,
            name: p.name,
            team: p.team,
            position: p.position,
            assists: p.assists
          })),
          
          mostValuable: topValuable.map((p: any) => ({
            id: p.id,
            name: p.name,
            team: p.team,
            position: p.position,
            marketValue: p.marketValue
          }))
        },

        marketAnalysis: {
          totalMarketValue: marketValueStats._sum.marketValue || 0,
          minimumValue: marketValueStats._min.marketValue || 0,
          maximumValue: marketValueStats._max.marketValue || 0,
          contractsExpiring: contractsExpiring.length,
          expiringContracts: contractsExpiring
        },

        attributesByPosition: positionAttributes as PositionAttributes,

        generatedAt: new Date().toISOString(),
        dataVersion: '1.0'
      };

    } catch (error: any) {
      console.error('Error en DashboardService.getDashboardStats:', error);
      throw new Error('No se pudieron obtener las estadísticas del dashboard');
    }
  }


// ============= OBTENER ATRIBUTOS POR POSICIÓN =============
async getAttributesByPosition(): Promise<AttributesByPositionItem[]> {
  try {
    // Obtener todos los jugadores con sus atributos
    const playersWithAttributes = await this.prisma.player.findMany({
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
        attributes: {
          isNot: null
        }
      }
    });

    // Agrupar y calcular promedios manualmente
    const positionGroups: { [key: string]: any } = {};

    playersWithAttributes.forEach((player: any) => {
      if (!player.attributes) return;

      if (!positionGroups[player.position]) {
        positionGroups[player.position] = {
          count: 0,
          pace: 0,
          shooting: 0,
          passing: 0,
          dribbling: 0,
          defending: 0,
          physical: 0
        };
      }

      const group = positionGroups[player.position];
      group.count++;
      group.pace += player.attributes.pace;
      group.shooting += player.attributes.shooting;
      group.passing += player.attributes.passing;
      group.dribbling += player.attributes.dribbling;
      group.defending += player.attributes.defending;
      group.physical += player.attributes.physical;
    });

    // Calcular promedios y formatear
    const formattedData = Object.keys(positionGroups).map(position => {
      const group = positionGroups[position];
      const count = group.count;

      return {
        position,
        playerCount: count,
        attributes: {
          Pace: Math.round(group.pace / count),
          Shooting: Math.round(group.shooting / count),
          Passing: Math.round(group.passing / count),
          Dribbling: Math.round(group.dribbling / count),
          Defending: Math.round(group.defending / count),
          Physicality: Math.round(group.physical / count)
        }
      };
    });

    return formattedData;

  } catch (error: any) {
    console.error('Error en DashboardService.getAttributesByPosition:', error);
    throw new Error('Error al obtener atributos por posición');
  }
}
}

