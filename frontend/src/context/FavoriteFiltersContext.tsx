// src/context/FavoriteFiltersContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FavoriteFilter, FavoriteFiltersContextType } from '../types/favoriteFilters';
import { PlayerFilters } from '../services/playerService';

const FavoriteFiltersContext = createContext<FavoriteFiltersContextType | undefined>(undefined);

export const useFavoriteFilters = () => {
  const context = useContext(FavoriteFiltersContext);
  if (!context) {
    throw new Error('useFavoriteFilters must be used within a FavoriteFiltersProvider');
  }
  return context;
};

const STORAGE_KEY = 'ase-athletics-favorite-filters';

export const FavoriteFiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteFilters, setFavoriteFilters] = useState<FavoriteFilter[]>([]);

  // Cargar filtros favoritos desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavoriteFilters(parsed);
      }
    } catch (error) {
      console.error('Error loading favorite filters:', error);
    }
  }, []);

  // Guardar filtros favoritos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteFilters));
    } catch (error) {
      console.error('Error saving favorite filters:', error);
    }
  }, [favoriteFilters]);

  const addFavoriteFilter = (name: string, filters: PlayerFilters, description?: string) => {
    const newFilter: FavoriteFilter = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      useCount: 0
    };

    setFavoriteFilters(prev => [...prev, newFilter]);
  };

  const removeFavoriteFilter = (id: string) => {
    setFavoriteFilters(prev => prev.filter(filter => filter.id !== id));
  };

  const updateFavoriteFilter = (id: string, updates: Partial<FavoriteFilter>) => {
    setFavoriteFilters(prev => 
      prev.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const applyFavoriteFilter = (id: string): PlayerFilters => {
    const favoriteFilter = favoriteFilters.find(filter => filter.id === id);
    
    if (!favoriteFilter) {
      throw new Error('Filtro favorito no encontrado');
    }

    // Actualizar estadísticas de uso
    updateFavoriteFilter(id, {
      lastUsed: new Date().toISOString(),
      useCount: favoriteFilter.useCount + 1
    });

    return { ...favoriteFilter.filters };
  };

  const getFavoriteFilter = (id: string): FavoriteFilter | undefined => {
    return favoriteFilters.find(filter => filter.id === id);
  };

  return (
    <FavoriteFiltersContext.Provider value={{
      favoriteFilters,
      addFavoriteFilter,
      removeFavoriteFilter,
      updateFavoriteFilter,
      applyFavoriteFilter,
      getFavoriteFilter
    }}>
      {children}
    </FavoriteFiltersContext.Provider>
  );
};