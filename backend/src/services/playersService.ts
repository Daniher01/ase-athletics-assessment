// backend/src/services/playersService.ts

import { PrismaClient } from '@prisma/client';
import { 
  PlayerFilters, 
  PlayerSortOptions, 
  PaginationParams, 
  PlayerResponse,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  PaginationMeta
} from '../types/players';
import { PlayerValidation } from '../utils/validation';

export class PlayersService {
  // constructor(private prisma: PrismaClient) {}
    private get prisma() {
    const { prisma } = require('../server');
    return prisma;
  }

  // ============= OBTENER LISTA DE JUGADORES =============
  async getPlayers(
    filters: PlayerFilters = {},
    sort: PlayerSortOptions = { field: 'name', order: 'asc' },
    pagination: PaginationParams = { page: 1, limit: 20 }
  ) {
    try {
      // Construir filtros WHERE para Prisma
      const whereClause = this.buildWhereClause(filters);
      
      // Construir ordenamiento
      const orderByClause = this.buildOrderByClause(sort);
      
      // Calcular offset para paginación
      const skip = (pagination.page - 1) * pagination.limit;

      // Ejecutar consultas en paralelo
      const [players, totalCount] = await Promise.all([
        this.prisma.player.findMany({
          where: whereClause,
          orderBy: orderByClause,
          skip,
          take: pagination.limit,
          include: {
            attributes: true
          }
        }),
        this.prisma.player.count({
          where: whereClause
        })
      ]);

      // Formatear jugadores para respuesta
      const formattedPlayers = players.map(this.formatPlayerResponse);
      
      // Calcular metadata de paginación
      const paginationMeta = this.calculatePaginationMeta(pagination, totalCount);

      return {
        players: formattedPlayers,
        pagination: paginationMeta,
        totalCount
      };

    } catch (error) {
      console.error('Error en PlayersService.getPlayers:', error);
      throw new Error('Error al obtener jugadores');
    }
  }

  // ============= OBTENER JUGADOR POR ID =============
  async getPlayerById(id: number): Promise<PlayerResponse> {
    try {
      const player = await this.prisma.player.findUnique({
        where: { id },
        include: {
          attributes: true
        }
      });

      if (!player) {
        throw new Error('Jugador no encontrado');
      }

      return this.formatPlayerResponse(player);

    } catch (error) {
      console.error('Error en PlayersService.getPlayerById:', error);
      throw error;
    }
  }

  // ============= CREAR JUGADOR =============
  async createPlayer(data: CreatePlayerRequest): Promise<PlayerResponse> {
    try {
      // Validar datos
      const validation = PlayerValidation.validateCreatePlayer(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

        const maxPlayer = await this.prisma.player.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        });
        const newId = (maxPlayer?.id || 0) + 1;

      // Crear jugador con atributos
      const player = await this.prisma.player.create({
        data: {
          id: newId,
          name: data.name.trim(),
          position: data.position,
          age: data.age,
          team: data.team.trim(),
          nationality: data.nationality.trim(),
          height: data.height,
          weight: data.weight,
          preferredFoot: data.preferredFoot || 'Derecho',
          goals: data.goals || 0,
          assists: data.assists || 0,
          appearances: data.appearances || 0,
          salary: data.salary || 0,
          contractEnd: data.contractEnd || new Date().toISOString(),
          marketValue: data.marketValue || 0,
          imageUrl: data.imageUrl,
          // Crear atributos si se proporcionan
          attributes: data.attributes ? {
            create: data.attributes
          } : undefined
        },
        include: {
          attributes: true
        }
      });

      return this.formatPlayerResponse(player);

    } catch (error) {
      console.error('Error en PlayersService.createPlayer:', error);
      throw error;
    }
  }

  // ============= ACTUALIZAR JUGADOR =============
  async updatePlayer(id: number, data: UpdatePlayerRequest): Promise<PlayerResponse> {
    try {
      // Verificar que el jugador existe
      await this.getPlayerById(id);

      // Validar datos de actualización
      const validation = PlayerValidation.validateUpdatePlayer(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Preparar datos para actualización
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.position !== undefined) updateData.position = data.position;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.team !== undefined) updateData.team = data.team.trim();
      if (data.nationality !== undefined) updateData.nationality = data.nationality.trim();
      if (data.height !== undefined) updateData.height = data.height;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.goals !== undefined) updateData.goals = data.goals;
      if (data.assists !== undefined) updateData.assists = data.assists;
      if (data.appearances !== undefined) updateData.appearances = data.appearances;
      if (data.salary !== undefined) updateData.salary = data.salary.toString();
      if (data.contractEnd !== undefined) updateData.contractEnd = new Date(data.contractEnd);
      if (data.marketValue !== undefined) updateData.marketValue = data.marketValue;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

      // Actualizar atributos si se proporcionan
      if (data.attributes) {
        updateData.attributes = {
          upsert: {
            create: data.attributes,
            update: data.attributes
          }
        };
      }

      // Actualizar jugador
      const player = await this.prisma.player.update({
        where: { id },
        data: updateData,
        include: {
          attributes: true
        }
      });

      return this.formatPlayerResponse(player);

    } catch (error) {
      console.error('Error en PlayersService.updatePlayer:', error);
      throw error;
    }
  }

  // ============= ELIMINAR JUGADOR =============
  async deletePlayer(id: number): Promise<void> {
    try {
      // Verificar que el jugador existe
      await this.getPlayerById(id);

      // Eliminar jugador (atributos se eliminan por CASCADE)
      await this.prisma.player.delete({
        where: { id }
      });

    } catch (error) {
      console.error('Error en PlayersService.deletePlayer:', error);
      throw error;
    }
  }

  // ============= BÚSQUEDA DE JUGADORES =============
  async searchPlayers(
    searchTerm: string, 
    pagination: PaginationParams = { page: 1, limit: 20 }
  ) {
    try {
      const searchFilters: PlayerFilters = {
        search: searchTerm
      };

      return await this.getPlayers(
        searchFilters,
        { field: 'name', order: 'asc' },
        pagination
      );

    } catch (error) {
      console.error('Error en PlayersService.searchPlayers:', error);
      throw new Error('Error al buscar jugadores');
    }
  }

  // ============= MÉTODOS PRIVADOS =============
  
  private buildWhereClause(filters: PlayerFilters) {
    const where: any = {};

    if (filters.position) {
      where.position = filters.position;
    }

    if (filters.team) {
      where.team = { contains: filters.team, mode: 'insensitive' };
    }

    if (filters.nationality) {
      where.nationality = { contains: filters.nationality, mode: 'insensitive' };
    }

    if (filters.minAge || filters.maxAge) {
      where.age = {};
      if (filters.minAge) where.age.gte = filters.minAge;
      if (filters.maxAge) where.age.lte = filters.maxAge;
    }

    if (filters.minMarketValue || filters.maxMarketValue) {
      where.marketValue = {};
      if (filters.minMarketValue) where.marketValue.gte = filters.minMarketValue;
      if (filters.maxMarketValue) where.marketValue.lte = filters.maxMarketValue;
    }

    // Búsqueda de texto en múltiples campos
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { team: { contains: filters.search, mode: 'insensitive' } },
        { nationality: { contains: filters.search, mode: 'insensitive' } },
        { position: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return where;
  }

  private buildOrderByClause(sort: PlayerSortOptions) {
    return {
      [sort.field]: sort.order
    };
  }

  private calculatePaginationMeta(
    pagination: PaginationParams,
    totalCount: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalCount / pagination.limit);
    
    return {
      currentPage: pagination.page,
      totalPages,
      totalCount,
      limit: pagination.limit,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    };
  }

  private formatPlayerResponse(player: any): PlayerResponse {
    return {
      id: player.id,
      name: player.name,
      position: player.position,
      age: player.age,
      team: player.team,
      nationality: player.nationality,
      height: player.height,
      weight: player.weight,
      goals: player.goals,
      assists: player.assists,
      appearances: player.appearances,
      salary: player.salary,
      contractEnd: player.contractEnd,
      marketValue: player.marketValue,
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
        diving: player.attributes.diving,
        handling: player.attributes.handling,
        kicking: player.attributes.kicking,
        reflexes: player.attributes.reflexes
      } : undefined,
      imageUrl: player.imageUrl,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    };
  }
}