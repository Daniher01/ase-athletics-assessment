// backend/src/types/dashboard.ts

// ============= INTERFACES PARA ESTADÍSTICAS BÁSICAS =============
export interface BasicStats {
  totalPlayers: number;
  totalReports: number;
  totalUsers: number;
  avgAge: number;
  avgMarketValue: number;
}

// ============= INTERFACES PARA ESTADÍSTICAS POR POSICIÓN =============
export interface PositionStats {
  position: string;
  count: number;
  avgAge: number;
  avgGoals: number;
  avgAssists: number;
  avgMarketValue: number;
}

// ============= INTERFACES PARA ESTADÍSTICAS POR EQUIPO =============
export interface TeamStats {
  team: string;
  count: number;
  avgAge: number;
  avgMarketValue: number;
}

// ============= INTERFACES PARA ESTADÍSTICAS POR NACIONALIDAD =============
export interface NationalityStats {
  nationality: string;
  count: number;
}

// ============= INTERFACES PARA TOP JUGADORES =============
export interface TopScorer {
  id: number;
  name: string;
  team: string;
  position: string;
  goals: number;
}

export interface TopAssister {
  id: number;
  name: string;
  team: string;
  position: string;
  assists: number;
}

export interface TopValuable {
  id: number;
  name: string;
  team: string;
  position: string;
  marketValue: number;
}

export interface TopPlayers {
  topScorers: TopScorer[];
  topAssisters: TopAssister[];
  mostValuable: TopValuable[];
}

// ============= INTERFACES PARA DISTRIBUCIÓN DE EDAD =============
export interface AgeRanges {
  '16-20': number;
  '21-25': number;
  '26-30': number;
  '31-35': number;
  '36+': number;
}

// ============= INTERFACES PARA ANÁLISIS DE MERCADO =============
export interface MarketAnalysis {
  totalMarketValue: number;
  minimumValue: number;
  maximumValue: number;
  contractsExpiring: number;
  expiringContracts: any[];
}

// ============= INTERFACES PARA ATRIBUTOS POR POSICIÓN =============
export interface PositionAttributes {
  [position: string]: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
}

// ============= INTERFACE PRINCIPAL DEL DASHBOARD =============
export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: {
    // Estadísticas básicas
    basicStats: BasicStats;
    
    // Distribuciones
    positionDistribution: PositionStats[];
    teamDistribution: TeamStats[];
    nationalityDistribution: NationalityStats[];
    ageDistribution: AgeRanges;
    
    // Top jugadores
    topPlayers: TopPlayers;
    
    // Análisis de mercado
    marketAnalysis: MarketAnalysis;
    
    // Atributos por posición
    attributesByPosition: PositionAttributes;
    
    // Metadata
    generatedAt: string;
    dataVersion: string;
  };
}

// ============= INTERFACES PARA RESPUESTAS API =============
export interface DashboardApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ============= INTERFACES PARA ATRIBUTOS POR POSICIÓN =============
export interface AttributesByPositionItem {
  position: string;
  playerCount: number;
  attributes: {
    Pace: number;
    Shooting: number;
    Passing: number;
    Dribbling: number;
    Defending: number;
    Physicality: number;
  };
}

export interface AttributesByPositionResponse {
  success: boolean;
  data: AttributesByPositionItem[];
}