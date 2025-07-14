// backend/src/utils/validation.ts

import { 
  CreatePlayerRequest, 
  UpdatePlayerRequest, 
  PlayerAttributes,
  ValidationResult,
  PaginationParams 
} from '../types/players';

export class PlayerValidation {

  // ============= VALIDAR CREACIÓN DE JUGADOR =============
  static validateCreatePlayer(data: CreatePlayerRequest): ValidationResult {
    const errors: string[] = [];

    // Validar nombre
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('El nombre del jugador es requerido');
    } else if (data.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (data.name.trim().length > 100) {
      errors.push('El nombre no puede tener más de 100 caracteres');
    }

    // Validar posición
    const validPositions = [
      'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
      'Mediocentro Defensivo', 'Mediocentro', 'Mediocentro Ofensivo',
      'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro'
    ];
    
    if (!data.position || !validPositions.includes(data.position)) {
      errors.push(`La posición debe ser una de: ${validPositions.join(', ')}`);
    }

    // Validar edad
    if (!data.age || typeof data.age !== 'number' || data.age < 16 || data.age > 50) {
      errors.push('La edad debe estar entre 16 y 50 años');
    }

    // Validar equipo
    if (!data.team || typeof data.team !== 'string' || data.team.trim().length === 0) {
      errors.push('El equipo del jugador es requerido');
    }

    // Validar nacionalidad
    if (!data.nationality || typeof data.nationality !== 'string' || data.nationality.trim().length === 0) {
      errors.push('La nacionalidad del jugador es requerida');
    }

    // Validar altura
    if (!data.height || typeof data.height !== 'number' || data.height < 150 || data.height > 220) {
      errors.push('La altura debe estar entre 150 y 220 cm');
    }

    // Validar peso
    if (!data.weight || typeof data.weight !== 'number' || data.weight < 50 || data.weight > 120) {
      errors.push('El peso debe estar entre 50 y 120 kg');
    }

    // Validar estadísticas opcionales
    if (data.goals !== undefined && (typeof data.goals !== 'number' || data.goals < 0)) {
      errors.push('Los goles deben ser un número positivo');
    }

    if (data.assists !== undefined && (typeof data.assists !== 'number' || data.assists < 0)) {
      errors.push('Las asistencias deben ser un número positivo');
    }

    if (data.appearances !== undefined && (typeof data.appearances !== 'number' || data.appearances < 0)) {
      errors.push('Las apariciones deben ser un número positivo');
    }

    if (data.marketValue !== undefined && (typeof data.marketValue !== 'number' || data.marketValue < 0)) {
      errors.push('El valor de mercado debe ser un número positivo');
    }

    // Validar atributos si se proporcionan
    if (data.attributes) {
      const attributeErrors = this.validatePlayerAttributes(data.attributes);
      errors.push(...attributeErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ============= VALIDAR ACTUALIZACIÓN DE JUGADOR =============
  static validateUpdatePlayer(data: UpdatePlayerRequest): ValidationResult {
    const errors: string[] = [];

    // Para update, todos los campos son opcionales, pero si se proporcionan deben ser válidos
    
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      } else if (data.name.trim().length > 100) {
        errors.push('El nombre no puede tener más de 100 caracteres');
      }
    }

    if (data.age !== undefined) {
      if (typeof data.age !== 'number' || data.age < 16 || data.age > 50) {
        errors.push('La edad debe estar entre 16 y 50 años');
      }
    }

    if (data.height !== undefined) {
      if (typeof data.height !== 'number' || data.height < 150 || data.height > 220) {
        errors.push('La altura debe estar entre 150 y 220 cm');
      }
    }

    if (data.weight !== undefined) {
      if (typeof data.weight !== 'number' || data.weight < 50 || data.weight > 120) {
        errors.push('El peso debe estar entre 50 y 120 kg');
      }
    }

    if (data.goals !== undefined && (typeof data.goals !== 'number' || data.goals < 0)) {
      errors.push('Los goles deben ser un número positivo');
    }

    if (data.assists !== undefined && (typeof data.assists !== 'number' || data.assists < 0)) {
      errors.push('Las asistencias deben ser un número positivo');
    }

    if (data.attributes) {
      const attributeErrors = this.validatePlayerAttributes(data.attributes);
      errors.push(...attributeErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ============= VALIDAR ATRIBUTOS DE JUGADOR =============
  private static validatePlayerAttributes(attributes: PlayerAttributes): string[] {
    const errors: string[] = [];
    
    const requiredAttributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
    
    for (const attr of requiredAttributes) {
      const value = (attributes as any)[attr];
      if (value === undefined || value === null) {
        errors.push(`El atributo ${attr} es requerido`);
      } else if (typeof value !== 'number' || value < 1 || value > 100) {
        errors.push(`El atributo ${attr} debe estar entre 1 y 100`);
      }
    }

    return errors;
  }

  // ============= VALIDAR PAGINACIÓN =============
  static validatePagination(page?: string, limit?: string): PaginationParams {
    const pageNum = Math.max(1, parseInt(page || '1') || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20') || 20));

    return {
      page: pageNum,
      limit: limitNum
    };
  }

  // ============= SANITIZAR BÚSQUEDA =============
  static sanitizeSearchTerm(searchTerm: any): string | null {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return null;
    }

    const sanitized = searchTerm
      .trim()
      .replace(/[<>]/g, '') // Remover caracteres peligrosos
      .substring(0, 100); // Limitar longitud
    
    if (sanitized.length < 2) {
      return null;
    }

    return sanitized;
  }

  // ============= VALIDAR ID =============
  static validateId(id: string): number | null {
    const numId = parseInt(id);
    
    if (isNaN(numId) || numId <= 0) {
      return null;
    }
    
    return numId;
  }
}