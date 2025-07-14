// backend/src/controllers/dashboardController.ts

import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

// Instancia de servicio
const dashboardService = new DashboardService();

export class DashboardController {

  // ============= GET /api/dashboard/stats =============
  static async getStats(req: Request, res: Response) {
    try {
      // Llamar al servicio (toda tu lógica compleja está ahí)
      const stats = await dashboardService.getDashboardStats();

      // Respuesta exitosa (mismo formato que tenías)
      res.status(200).json({
        success: true,
        message: 'Estadísticas del dashboard obtenidas exitosamente',
        data: stats
      });

    } catch (error: any) {
      console.error('Error en DashboardController.getStats:', error);
      
      // Manejo de errores (mantengo tu lógica exacta)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las estadísticas del dashboard'
      });
    }
  }
}