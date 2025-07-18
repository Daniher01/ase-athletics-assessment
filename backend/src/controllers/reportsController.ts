// backend/src/controllers/reportsController.ts
import { Request, Response } from 'express';
import { ReportsService } from '../services/reportsService';
import { 
  CreateReportRequest, 
  UpdateReportRequest, 
  ReportQueryParams,
  ReportFilters,
  ReportPaginationParams 
} from '../types/reports';

export class ReportsController {
  
  // GET /api/reports - Lista de reportes con filtros y paginación
  static async getReports(req: Request, res: Response) {
    try {
      const queryParams = req.query as ReportQueryParams;
      
      const pagination: ReportPaginationParams = {
        page: parseInt(queryParams.page || '1'),
        limit: parseInt(queryParams.limit || '10')
      };

      const filters: ReportFilters = {
        playerId: queryParams.playerId ? parseInt(queryParams.playerId) : undefined,
        scoutId: queryParams.scoutId ? parseInt(queryParams.scoutId) : undefined,
        recommendation: queryParams.recommendation as 'fichar' | 'monitorear' | 'pasar' | undefined,
        competition: queryParams.competition,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      };

      const result = await ReportsService.getReports(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Reportes obtenidos exitosamente',
        data: result.reports,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Error en getReports:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // GET /api/reports/:id - Detalles de reporte específico
  static async getReportById(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.id);

      if (isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de reporte inválido'
        });
      }

      const report = await ReportsService.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reporte obtenido exitosamente',
        data: report
      });

    } catch (error) {
      console.error('Error en getReportById:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // POST /api/reports - Crear nuevo reporte
  static async createReport(req: Request, res: Response) {
    try {
      const reportData: CreateReportRequest = req.body;

      const newReport = await ReportsService.createReport(reportData);

      res.status(201).json({
        success: true,
        message: 'Reporte creado exitosamente',
        data: newReport
      });

    } catch (error) {
      console.error('Error en createReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // PUT /api/reports/:id - Actualizar reporte existente
  static async updateReport(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.id);
      const updateData: UpdateReportRequest = req.body;

      if (isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de reporte inválido'
        });
      }

      const updatedReport = await ReportsService.updateReport(reportId, updateData);

      res.status(200).json({
        success: true,
        message: 'Reporte actualizado exitosamente',
        data: updatedReport
      });

    } catch (error) {
      console.error('Error en updateReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // DELETE /api/reports/:id - Eliminar reporte
  static async deleteReport(req: Request, res: Response) {
    try {
      const reportId = parseInt(req.params.id);

      if (isNaN(reportId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de reporte inválido'
        });
      }

      await ReportsService.deleteReport(reportId);

      res.status(200).json({
        success: true,
        message: 'Reporte eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error en deleteReport:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}