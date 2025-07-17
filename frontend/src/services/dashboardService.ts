// src/services/dashboardService.ts
import { api } from './api';

export interface BasicStats {
  totalPlayers: number;
  totalReports: number;
  totalUsers: number;
  avgAge: number;
  avgMarketValue: number;
}

export interface PositionDistribution {
  position: string;
  count: number;
  avgAge: number;
  avgGoals: number;
  avgAssists: number;
  avgMarketValue: number;
}

export interface TeamDistribution {
  team: string;
  count: number;
  avgAge: number;
  avgMarketValue: number;
}

export interface NationalityDistribution {
  nationality: string;
  count: number;
}

export interface TopPlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  goals?: number;
  assists?: number;
  marketValue?: number;
}

export interface TopPlayers {
  topScorers: TopPlayer[];
  topAssisters: TopPlayer[];
  mostValuable: TopPlayer[];
}

export interface MarketAnalysis {
  totalMarketValue: number;
  minimumValue: number;
  maximumValue: number;
  contractsExpiring: number;
  expiringContracts: Array<{
    id: number;
    name: string;
    team: string;
    contractEnd: string;
  }>;
}

// ✅ ACTUALIZAR: Cambiar la estructura para que coincida con el componente
export interface AttributesByPosition {
  position: string;
  playerCount: number;
  attributes: {
    Pace: number;
    Shooting: number;
    Passing: number;
    Dribbling: number;
    Defending: number;
    Physicality: number;
  };
}

export interface DashboardData {
  basicStats: BasicStats;
  positionDistribution: PositionDistribution[];
  teamDistribution: TeamDistribution[];
  nationalityDistribution: NationalityDistribution[];
  ageDistribution: { [key: string]: number };
  topPlayers: TopPlayers;
  marketAnalysis: MarketAnalysis;
  attributesByPosition: AttributesByPosition[]; // ✅ CAMBIAR: Array en lugar de objeto
  generatedAt: string;
  dataVersion: string;
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data; // Extraer solo la data del response
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Método para obtener atributos por posición del endpoint correcto
  async getAttributesByPosition(): Promise<AttributesByPosition[]> {
    try {
      const response = await api.get('/dashboard/stats/position');
      
      // Si el backend devuelve directamente el array
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si el backend devuelve un objeto, convertirlo a array
      if (typeof response.data.data === 'object') {
        return Object.entries(response.data.data).map(([position, data]: [string, any]) => ({
          position,
          playerCount: data.playerCount || 0,
          attributes: {
            Pace: Math.round(data.pace || 0),
            Shooting: Math.round(data.shooting || 0),
            Passing: Math.round(data.passing || 0),
            Dribbling: Math.round(data.dribbling || 0),
            Defending: Math.round(data.defending || 0),
            Physicality: Math.round(data.physical || 0) // ✅ Mapear 'physical' a 'Physicality'
          }
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching attributes by position:', error);
      // Si hay error, intentar obtener del dashboard general
      try {
        const dashboardData = await this.getDashboardData();
        if (Array.isArray(dashboardData.attributesByPosition)) {
          return dashboardData.attributesByPosition;
        }
        
        // Si está en formato objeto, convertir
        if (typeof dashboardData.attributesByPosition === 'object') {
          return Object.entries(dashboardData.attributesByPosition).map(([position, data]: [string, any]) => ({
            position,
            playerCount: data.playerCount || 0,
            attributes: {
              Pace: Math.round(data.pace || 0),
              Shooting: Math.round(data.shooting || 0),
              Passing: Math.round(data.passing || 0),
              Dribbling: Math.round(data.dribbling || 0),
              Defending: Math.round(data.defending || 0),
              Physicality: Math.round(data.physical || 0)
            }
          }));
        }
      } catch (dashboardError) {
        console.error('Fallback to dashboard data also failed:', dashboardError);
      }
      
      throw error;
    }
  }

  // Métodos auxiliares existentes
  async getBasicStats(): Promise<BasicStats> {
    const data = await this.getDashboardData();
    return data.basicStats;
  }

  async getPositionDistribution(): Promise<PositionDistribution[]> {
    const data = await this.getDashboardData();
    return data.positionDistribution;
  }

  async getTopScorers(limit: number = 10): Promise<TopPlayer[]> {
    const data = await this.getDashboardData();
    return data.topPlayers.topScorers.slice(0, limit);
  }

  async getTopAssisters(limit: number = 10): Promise<TopPlayer[]> {
    const data = await this.getDashboardData();
    return data.topPlayers.topAssisters.slice(0, limit);
  }

  async getMostValuable(limit: number = 10): Promise<TopPlayer[]> {
    const data = await this.getDashboardData();
    return data.topPlayers.mostValuable.slice(0, limit);
  }

  async getMarketAnalysis(): Promise<MarketAnalysis> {
    const data = await this.getDashboardData();
    return data.marketAnalysis;
  }
}

export const dashboardService = new DashboardService();