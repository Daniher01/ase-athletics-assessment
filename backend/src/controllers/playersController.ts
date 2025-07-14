// backend/src/controllers/playersController.ts

import { Request, Response } from 'express';
import { PlayersService } from '../services/playersService';
import { 
  PlayerFilters, 
  PlayerSortOptions, 
  PaginationParams,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  ApiResponse,
  PlayerQueryParams
} from '../types/players';
import { PlayerValidation } from '../utils/validation';

// Instancia de servicio
const playersService = new PlayersService();

export class PlayersController {
  
  // ============= GET /api/players =============
  static async getPlayers(req: Request, res: Response) {
    try {
      // Extraer parámetros de query (exactamente como los tenías)
      const {
        position,
        team,
        nationality,
        minAge,
        maxAge,
        minMarketValue,
        maxMarketValue,
        search,
        sortField = 'name',
        sortOrder = 'asc',
        page = '1',
        limit = '20'
      } = req.query as PlayerQueryParams;

      // Parsear filtros (usando las mismas validaciones que tenías)
      const filters: PlayerFilters = {};
      
      if (position) filters.position = position;
      if (team) filters.team = team;
      if (nationality) filters.nationality = nationality;
      if (minAge) filters.minAge = parseInt(minAge);
      if (maxAge) filters.maxAge = parseInt(maxAge);
      if (minMarketValue) filters.minMarketValue = parseInt(minMarketValue);
      if (maxMarketValue) filters.maxMarketValue = parseInt(maxMarketValue);
      if (search) {
        const sanitizedSearch = PlayerValidation.sanitizeSearchTerm(search);
        if (sanitizedSearch) filters.search = sanitizedSearch;
      }

      // Parsear ordenamiento
      const sort: PlayerSortOptions = {
        field: sortField as any || 'name',
        order: (sortOrder === 'desc') ? 'desc' : 'asc'
      };

      // Parsear paginación
      const pagination = PlayerValidation.validatePagination(page, limit);

      // Llamar al servicio (aquí está toda tu lógica actual)
      const result = await playersService.getPlayers(filters, sort, pagination);

      // Respuesta exitosa (mismo formato que tenías)
      res.status(200).json({
        success: true,
        message: `Se encontraron ${result.totalCount} jugadores`,
        data: result.players,
        pagination: result.pagination,
        filters: filters
      });

    } catch (error: any) {
      console.error('Error en PlayersController.getPlayers:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los jugadores'
      });
    }
  }

  // ============= GET /api/players/:id =============
  static async getPlayerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar ID
      const playerId = PlayerValidation.validateId(id);
      if (!playerId) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del jugador debe ser un número válido'
        });
      }

      // Llamar al servicio
      const player = await playersService.getPlayerById(playerId);

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Jugador encontrado',
        data: player
      });

    } catch (error: any) {
      console.error('Error en PlayersController.getPlayerById:', error);
      
      if (error.message === 'Jugador no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Jugador no encontrado',
          message: 'No existe un jugador con ese ID'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el jugador'
      });
    }
  }

  // ============= POST /api/players =============
  static async createPlayer(req: Request, res: Response) {
    try {
      const playerData: CreatePlayerRequest = req.body;

      // Las validaciones las hace el service
      const newPlayer = await playersService.createPlayer(playerData);

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        message: 'Jugador creado exitosamente',
        data: newPlayer
      });

    } catch (error: any) {
      console.error('Error en PlayersController.createPlayer:', error);
      
      // Errores de validación (vienen del service)
      if (error.message.includes('requerido') || 
          error.message.includes('debe estar') ||
          error.message.includes('debe tener') ||
          error.message.includes('debe ser')) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo crear el jugador'
      });
    }
  }

  // ============= PUT /api/players/:id =============
  static async updatePlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar ID
      const playerId = PlayerValidation.validateId(id);
      if (!playerId) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del jugador debe ser un número válido'
        });
      }

      const updateData: UpdatePlayerRequest = req.body;

      // Llamar al servicio
      const updatedPlayer = await playersService.updatePlayer(playerId, updateData);

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Jugador actualizado exitosamente',
        data: updatedPlayer
      });

    } catch (error: any) {
      console.error('Error en PlayersController.updatePlayer:', error);
      
      if (error.message === 'Jugador no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Jugador no encontrado',
          message: 'No existe un jugador con ese ID'
        });
      }

      if (error.message.includes('debe estar') || 
          error.message.includes('debe tener') ||
          error.message.includes('debe ser')) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el jugador'
      });
    }
  }

  // ============= DELETE /api/players/:id =============
  static async deletePlayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar ID
      const playerId = PlayerValidation.validateId(id);
      if (!playerId) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del jugador debe ser un número válido'
        });
      }

      // Llamar al servicio
      await playersService.deletePlayer(playerId);

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Jugador eliminado exitosamente'
      });

    } catch (error: any) {
      console.error('Error en PlayersController.deletePlayer:', error);
      
      if (error.message === 'Jugador no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Jugador no encontrado',
          message: 'No existe un jugador con ese ID'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar el jugador'
      });
    }
  }

  // ============= GET /api/players/search =============
  static async searchPlayers(req: Request, res: Response) {
    try {
      const { q: searchTerm, page = '1', limit = '20' } = req.query;

      // Validar término de búsqueda
      const sanitizedTerm = PlayerValidation.sanitizeSearchTerm(searchTerm);
      if (!sanitizedTerm) {
        return res.status(400).json({
          success: false,
          error: 'Término de búsqueda inválido',
          message: 'Debes proporcionar un término de búsqueda válido (mínimo 2 caracteres)'
        });
      }

      // Parsear paginación
      const pagination = PlayerValidation.validatePagination(page as string, limit as string);

      // Llamar al servicio
      const result = await playersService.searchPlayers(sanitizedTerm, pagination);

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: `Se encontraron ${result.totalCount} jugadores para "${sanitizedTerm}"`,
        data: result.players,
        pagination: result.pagination,
        searchTerm: sanitizedTerm
      });

    } catch (error: any) {
      console.error('Error en PlayersController.searchPlayers:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo realizar la búsqueda'
      });
    }
  }
}