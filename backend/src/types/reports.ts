// backend/src/types/reports.ts

// ============= INTERFACES PARA REQUESTS =============
export interface CreateReportRequest {
  playerId: number;
  scoutId: number;
  matchDate: string;
  competition?: string;
  opponent?: string;
  overallRating: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  recommendation: 'fichar' | 'monitorear' | 'pasar';
  notes?: string;
}

export interface UpdateReportRequest extends Partial<CreateReportRequest> {
  // Todos los campos son opcionales para update
}

// ============= INTERFACES PARA RESPONSES =============
export interface ReportResponse {
  id: number;
  playerId: number;
  scoutId: number;
  matchDate: Date;
  competition?: string;
  opponent?: string;
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones
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

// ============= INTERFACES PARA LISTAS =============
export interface ReportsListResponse {
  success: boolean;
  message: string;
  data: ReportResponse[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============= INTERFACES PARA FILTROS =============
export interface ReportFilters {
  playerId?: number;
  scoutId?: number;
  recommendation?: 'fichar' | 'monitorear' | 'pasar';
  competition?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReportQueryParams {
  page?: string;
  limit?: string;
  playerId?: string;
  scoutId?: string;
  recommendation?: string;
  competition?: string;
  startDate?: string;
  endDate?: string;
}

// ============= INTERFACES PARA PAGINACIÓN =============
export interface ReportPaginationParams {
  page: number;
  limit: number;
}

// ============= INTERFACES PARA VALIDACIÓN =============
export interface ReportValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============= INTERFACES PARA RESPUESTAS API =============
export interface ReportApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}