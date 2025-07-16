// src/types/favoriteFilters.ts
import { PlayerFilters } from '../services/playerService';

export interface FavoriteFilter {
  id: string;
  name: string;
  description?: string;
  filters: PlayerFilters;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
}

export interface FavoriteFiltersContextType {
  favoriteFilters: FavoriteFilter[];
  addFavoriteFilter: (name: string, filters: PlayerFilters, description?: string) => void;
  removeFavoriteFilter: (id: string) => void;
  updateFavoriteFilter: (id: string, updates: Partial<FavoriteFilter>) => void;
  applyFavoriteFilter: (id: string) => PlayerFilters;
  getFavoriteFilter: (id: string) => FavoriteFilter | undefined;
}