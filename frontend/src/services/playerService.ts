// src/services/playerService.ts
import { api } from './api';

export interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  team: string;
  nationality: string;
  height: number;
  weight: number;
  goals: number;
  assists: number;
  appearances: number;
  salary: number;
  contractEnd: string;
  marketValue: number;
  attributes: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    finishing?: number;
    crossing?: number;
    longShots?: number;
    positioning?: number;
    diving?: number;
    handling?: number;
    kicking?: number;
    reflexes?: number;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayersResponse {
  success: boolean;
  message: string;
  data: Player[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: any;
}

export interface PlayerFilters {
  search?: string;
  position?: string;
  team?: string;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  minGoals?: number;
  maxGoals?: number;
  sortBy?: 'name' | 'age' | 'goals' | 'assists' | 'marketValue';
  sortOrder?: 'asc' | 'desc';
}

class PlayerService {
  async getPlayers(
    page: number = 1,
    limit: number = 20,
    filters: PlayerFilters = {}
  ): Promise<PlayersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      });

      const response = await api.get(`/players?${params}`);
      return response.data; 
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  async getPlayerById(id: number): Promise<Player> {
    try {
      const response = await api.get(`/players/${id}`);
      return response.data.data; // Ajustar según tu estructura de API
    } catch (error) {
      console.error('Error fetching player:', error);
      throw error;
    }
  }

  async createPlayer(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
    try {
      const response = await api.post('/players', playerData);
      return response.data.data; // Ajustar según tu estructura de API
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  async updatePlayer(id: number, playerData: Partial<Player>): Promise<Player> {
    try {
      const response = await api.put(`/players/${id}`, playerData);
      return response.data.data; // Ajustar según tu estructura de API
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  }

  async deletePlayer(id: number): Promise<void> {
    try {
      await api.delete(`/players/${id}`);
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }

  async searchPlayers(query: string): Promise<Player[]> {
    try {
      const response = await api.get(`/players/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching players:', error);
      throw error;
    }
  }

  // Obtener listas para filtros 
  async getTeams(): Promise<string[]> {
    try {
      const response = await this.getPlayers(1, 1000); // Obtener todos los jugadores
      const teams = [...new Set(response.data.map(player => player.team))];
      return teams.sort();
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  async getNationalities(): Promise<string[]> {
    try {
      const response = await this.getPlayers(1, 1000); // Obtener todos los jugadores
      const nationalities = [...new Set(response.data.map(player => player.nationality))];
      return nationalities.sort();
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      return [];
    }
  }

  async getPositions(): Promise<string[]> {
    try {
      const response = await this.getPlayers(1, 1000); // Obtener todos los jugadores
      const positions = [...new Set(response.data.map(player => player.position))];
      return positions.sort();
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  // Método específico para análisis MCP
  async analizarJugador(nombreJugador: string): Promise<any> {
    try {
      const response = await api.post('/mcp/analizar-jugador', {
        nombre_jugador: nombreJugador
      });
      return response.data;
    } catch (error) {
      console.error('Error analizando jugador:', error);
      throw error;
    }
  }
}

export const playerService = new PlayerService();