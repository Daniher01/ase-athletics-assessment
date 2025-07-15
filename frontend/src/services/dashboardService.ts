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

export interface AttributesByPosition {
  [position: string]: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
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
  attributesByPosition: AttributesByPosition;
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

  // Métodos auxiliares para obtener datos específicos
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