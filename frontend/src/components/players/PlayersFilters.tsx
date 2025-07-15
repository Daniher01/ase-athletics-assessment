// src/components/players/PlayersFilters.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { PlayerFilters } from '../../services/playerService';

interface PlayersFiltersProps {
  filters: PlayerFilters;
  onFiltersChange: (filters: PlayerFilters) => void;
  onClearFilters: () => void;
  onAddPlayer: () => void;
  teams: string[];
  nationalities: string[];
  positions: string[];
}

const PlayersFilters: React.FC<PlayersFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onAddPlayer,
  teams,
  nationalities,
  positions
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Debounce para la búsqueda
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchValue });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const handleFilterChange = (key: keyof PlayerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof PlayerFilters];
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-secondary-900">Filtros de Jugadores</h3>
        <button
          onClick={onAddPlayer}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Agregar Jugador
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
        <input
          type="text"
          placeholder="Buscar jugadores por nombre..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
        />
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Posición
          </label>
          <select
            value={filters.position || ''}
            onChange={(e) => handleFilterChange('position', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Todas las posiciones</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Equipo
          </label>
          <select
            value={filters.team || ''}
            onChange={(e) => handleFilterChange('team', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Todos los equipos</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Nacionalidad
          </label>
          <select
            value={filters.nationality || ''}
            onChange={(e) => handleFilterChange('nationality', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Todas las nacionalidades</option>
            {nationalities.map(nationality => (
              <option key={nationality} value={nationality}>{nationality}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          <Filter size={16} />
          {showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Edad mínima
              </label>
              <input
                type="number"
                placeholder="Ej: 18"
                value={filters.minAge || ''}
                onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Edad máxima
              </label>
              <input
                type="number"
                placeholder="Ej: 35"
                value={filters.maxAge || ''}
                onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Goles mínimos
              </label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={filters.minGoals || ''}
                onChange={(e) => handleFilterChange('minGoals', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Goles máximos
              </label>
              <input
                type="number"
                placeholder="Ej: 50"
                value={filters.maxGoals || ''}
                onChange={(e) => handleFilterChange('maxGoals', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersFilters;