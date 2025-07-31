// backend/src/types/players.ts

// ============= INTERFACES PARA FILTROS =============
export interface PlayerFilters {
  position?: string;
  team?: string;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  minMarketValue?: number;
  maxMarketValue?: number;
  search?: string;
}

// ============= INTERFACES PARA ORDENAMIENTO =============
export interface PlayerSortOptions {
  field: 'name' | 'age' | 'position' | 'team' | 'marketValue' | 'goals' | 'assists';
  order: 'asc' | 'desc';
}

// ============= INTERFACES PARA PAGINACIÓN =============
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============= INTERFACES PARA ATRIBUTOS =============
export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  finishing: number;
  crossing: number;
  longShots: number;
  positioning: number;
  // Atributos de portero (opcionales)
  diving?: number;
  handling?: number;
  kicking?: number;
  reflexes?: number;
}

// ============= INTERFACE PARA RESPUESTA DE JUGADOR =============
export interface PlayerResponse {
  id: number;
  name: string;
  position: string;
  age: number;
  team: string;
  nationality: string;
  height: number;
  weight: number;
  preferredFoot?: string;
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed?: number;
  yellowCards?: number;
  redCards?: number;
  salary: number;
  contractEnd: Date;
  marketValue: number;
  attributes?: PlayerAttributes;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= INTERFACE PARA LISTA DE JUGADORES =============
export interface PlayersListResponse {
  success: boolean;
  message: string;
  data: PlayerResponse[];
  pagination: PaginationMeta;
  filters: PlayerFilters;
}

// ============= INTERFACES PARA REQUESTS =============
export interface CreatePlayerRequest {
  name: string;
  position: string;
  age: number;
  team: string;
  nationality: string;
  height: number;
  weight: number;
  preferredFoot?: string;
  goals?: number;
  assists?: number;
  appearances?: number;
  salary?: number;
  contractEnd?: string;
  marketValue?: number;
  attributes?: PlayerAttributes;
  imageUrl?: string;
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> {
  // Todos los campos son opcionales para update
}

// ============= INTERFACES PARA RESPUESTAS API =============
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ============= TIPOS PARA VALIDACIÓN =============
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============= TIPOS PARA QUERIES =============
export interface PlayerQueryParams {
  // Filtros
  position?: string;
  team?: string;
  nationality?: string;
  minAge?: string;
  maxAge?: string;
  minMarketValue?: string;
  maxMarketValue?: string;
  search?: string;
  
  // Ordenamiento
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Paginación
  page?: string;
  limit?: string;
}