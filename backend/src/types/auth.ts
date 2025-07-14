// backend/src/types/auth.ts

// ============= INTERFACES PARA REQUESTS =============
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============= INTERFACES PARA RESPONSES =============
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface AuthResponse {
  message: string;
  user: UserResponse;
  token: string;
}

// ============= JWT PAYLOAD =============
export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// ============= INTERFACES PARA VALIDACIÓN =============
export interface AuthValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============= INTERFACES PARA RESPUESTAS API =============
export interface AuthApiResponse<T> {
  success?: boolean;
  message: string;
  user?: UserResponse;
  token?: string;
  data?: T;
  error?: string;
}