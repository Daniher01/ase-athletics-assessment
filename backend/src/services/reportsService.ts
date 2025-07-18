// backend/src/services/reportsService.ts
import { PrismaClient } from '@prisma/client';
import { 
  CreateReportRequest, 
  UpdateReportRequest, 
  ReportResponse, 
  ReportFilters, 
  ReportPaginationParams 
} from '../types/reports';

const prisma = new PrismaClient();

export class ReportsService {
  
  // Obtener reportes con filtros y paginación
  static async getReports(filters: ReportFilters, pagination: ReportPaginationParams) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filters.playerId) {
      where.playerId = filters.playerId;
    }
    
    if (filters.scoutId) {
      where.scoutId = filters.scoutId;
    }
    
    if (filters.recommendation) {
      where.recommendation = filters.recommendation;
    }
    
    if (filters.competition) {
      where.competition = {
        contains: filters.competition,
        mode: 'insensitive'
      };
    }
    
    if (filters.startDate || filters.endDate) {
      where.matchDate = {};
      if (filters.startDate) {
        where.matchDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.matchDate.lte = new Date(filters.endDate);
      }
    }

    const rawReports = await prisma.scoutReport.findMany({
      where,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            team: true
          }
        },
        scout: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const reports = rawReports.map(report => ({
      ...report,
      competition: report.competition ?? undefined,
      opponent: report.opponent ?? undefined,
      notes: report.notes ?? undefined
    }));

    const totalCount = await prisma.scoutReport.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return {
      reports,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  // Obtener reporte por ID
  static async getReportById(id: number): Promise<ReportResponse | null> {
    const report = await prisma.scoutReport.findUnique({
      where: { id },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            team: true
          }
        },
        scout: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!report) return null;

    return {
      ...report,
      competition: report.competition ?? undefined,
      opponent: report.opponent ?? undefined,
      notes: report.notes ?? undefined
    };
  }

  // Crear nuevo reporte
  static async createReport(data: CreateReportRequest): Promise<ReportResponse> {
    const report = await prisma.scoutReport.create({
      data: {
        playerId: data.playerId,
        scoutId: data.scoutId,
        matchDate: new Date(data.matchDate),
        competition: data.competition,
        opponent: data.opponent,
        overallRating: data.overallRating,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        recommendation: data.recommendation,
        notes: data.notes
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            team: true
          }
        },
        scout: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      ...report,
      competition: report.competition ?? undefined,
      opponent: report.opponent ?? undefined,
      notes: report.notes ?? undefined
    };
  }

  // Actualizar reporte
  static async updateReport(id: number, data: UpdateReportRequest): Promise<ReportResponse> {
    const updateData: any = {};
    
    if (data.playerId !== undefined) updateData.playerId = data.playerId;
    if (data.scoutId !== undefined) updateData.scoutId = data.scoutId;
    if (data.matchDate !== undefined) updateData.matchDate = new Date(data.matchDate);
    if (data.competition !== undefined) updateData.competition = data.competition;
    if (data.opponent !== undefined) updateData.opponent = data.opponent;
    if (data.overallRating !== undefined) updateData.overallRating = data.overallRating;
    if (data.strengths !== undefined) updateData.strengths = data.strengths;
    if (data.weaknesses !== undefined) updateData.weaknesses = data.weaknesses;
    if (data.recommendation !== undefined) updateData.recommendation = data.recommendation;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedReport = await prisma.scoutReport.update({
      where: { id },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            position: true,
            team: true
          }
        },
        scout: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      ...updatedReport,
      competition: updatedReport.competition ?? undefined,
      opponent: updatedReport.opponent ?? undefined,
      notes: updatedReport.notes ?? undefined
    };
  }

  // Eliminar reporte
  static async deleteReport(id: number): Promise<void> {
    await prisma.scoutReport.delete({
      where: { id }
    });
  }
}