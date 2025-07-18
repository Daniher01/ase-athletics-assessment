// src/services/reportsService.ts
import { api } from './api';

export interface Scout {
  id: number;
  name: string;
  email: string;
}

export interface Report {
  id: number;
  playerId: number;
  scoutId: number;
  matchDate: string;
  competition: string;
  opponent: string;
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  player: {
    id: number;
    name: string;
    position: string;
    team: string;
  };
  scout: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: Report[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ReportFilters {
  playerId?: number;
  scoutId?: number;
  recommendation?: string;
  matchDate?: string;
  competition?: string;
  minRating?: number;
  maxRating?: number;
}

export interface CreateReportData {
  playerId: number;
  scoutId: number;
  matchDate: string;
  competition: string;
  opponent: string;
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  notes: string;
}

class ReportsService {
  async getReports(
    page: number = 1,
    limit: number = 10,
    filters: ReportFilters = {}
  ): Promise<ReportsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Agregar filtros si existen
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/reports?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async getReportById(id: number): Promise<Report> {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  async createReport(reportData: CreateReportData): Promise<Report> {
    try {
      const response = await api.post('/reports', reportData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateReport(id: number, reportData: Partial<CreateReportData>): Promise<Report> {
    try {
      const response = await api.put(`/reports/${id}`, reportData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  async deleteReport(id: number): Promise<void> {
    try {
      await api.delete(`/reports/${id}`);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  // Helpers para filtros
  async getAvailableRecommendations(): Promise<string[]> {
    try {
      const response = await this.getReports(1, 1000);
      const recommendations = [...new Set(response.data.map(report => report.recommendation))];
      return recommendations.filter(rec => rec && rec.trim() !== '');
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return ['fichar', 'monitorear', 'pasar'];
    }
  }

  async getAvailableCompetitions(): Promise<string[]> {
    try {
      const response = await this.getReports(1, 1000);
      const competitions = [...new Set(response.data.map(report => report.competition))];
      return competitions.filter(comp => comp && comp.trim() !== '');
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return [];
    }
  }

  async getAvailableScouts(): Promise<Scout[]> {
    try {
      const response = await this.getReports(1, 1000);
      const scouts = response.data.map(report => report.scout);
      const uniqueScouts = scouts.filter((scout, index, self) => 
        index === self.findIndex(s => s.id === scout.id)
      );
      return uniqueScouts;
    } catch (error) {
      console.error('Error fetching scouts:', error);
      return [];
    }
  }
}

export const reportsService = new ReportsService();