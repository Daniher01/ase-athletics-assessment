// src/components/players/FavoriteFiltersDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Star, ChevronDown, Plus, Trash2, Clock, TrendingUp } from 'lucide-react';
import { PlayerFilters } from '../../services/playerService';
import { useFavoriteFilters } from '../../context/FavoriteFiltersContext';
import { useToast } from '../../context/ToastContext';

interface FavoriteFiltersDropdownProps {
  currentFilters: PlayerFilters;
  onApplyFilters: (filters: PlayerFilters) => void;
  disabled?: boolean;
}

const FavoriteFiltersDropdown: React.FC<FavoriteFiltersDropdownProps> = ({
  currentFilters,
  onApplyFilters,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const { favoriteFilters, addFavoriteFilter, removeFavoriteFilter, applyFavoriteFilter } = useFavoriteFilters();
  const toast = useToast();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowSaveModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = () => {
    return Object.keys(currentFilters).some(key => {
      const value = currentFilters[key as keyof PlayerFilters];
      return value !== undefined && value !== null && value !== '';
    });
  };

  const handleSaveFavorite = () => {
    if (!hasActiveFilters()) {
      toast.warning('Sin filtros', 'No hay filtros activos para guardar');
      return;
    }

    if (!saveName.trim()) {
      toast.error('Nombre requerido', 'Por favor ingresa un nombre para el filtro');
      return;
    }

    try {
      addFavoriteFilter(saveName.trim(), currentFilters, saveDescription.trim() || undefined);
      toast.success('Filtro guardado', `"${saveName}" se ha guardado en tus favoritos`);
      setSaveName('');
      setSaveDescription('');
      setShowSaveModal(false);
      setIsOpen(false);
    } catch (error) {
      toast.error('Error al guardar', 'No se pudo guardar el filtro favorito');
    }
  };

  const handleApplyFavorite = (id: string) => {
    try {
      const filters = applyFavoriteFilter(id);
      onApplyFilters(filters);
      setIsOpen(false);
      toast.success('Filtro aplicado', 'Los filtros favoritos se han aplicado');
    } catch (error) {
      toast.error('Error al aplicar', 'No se pudo aplicar el filtro favorito');
    }
  };

  const handleRemoveFavorite = (id: string, name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      removeFavoriteFilter(id);
      toast.success('Filtro eliminado', `"${name}" se ha eliminado de tus favoritos`);
    } catch (error) {
      toast.error('Error al eliminar', 'No se pudo eliminar el filtro favorito');
    }
  };

  const getFilterSummary = (filters: PlayerFilters) => {
    const parts = [];
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.position) parts.push(filters.position);
    if (filters.team) parts.push(filters.team);
    if (filters.nationality) parts.push(filters.nationality);
    if (filters.minAge || filters.maxAge) parts.push(`${filters.minAge || 'min'}-${filters.maxAge || 'max'} años`);
    
    return parts.length > 0 ? parts.join(' • ') : 'Filtros básicos';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Ordenar favoritos por uso más reciente
  const sortedFavorites = [...favoriteFilters].sort((a, b) => {
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    if (a.lastUsed) return -1;
    if (b.lastUsed) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Star size={16} className={favoriteFilters.length > 0 ? 'text-yellow-500' : 'text-secondary-400'} />
          <span className="text-sm">Favoritos</span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-80 bg-white border border-secondary-200 rounded-lg shadow-lg z-50">
            {/* Header */}
            <div className="p-4 border-b border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-secondary-900">Filtros Favoritos</h3>
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={!hasActiveFilters()}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    hasActiveFilters() 
                      ? 'text-primary-600 hover:bg-primary-50' 
                      : 'text-secondary-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={12} />
                  Guardar actual
                </button>
              </div>
              <p className="text-xs text-secondary-600">
                {favoriteFilters.length} filtro{favoriteFilters.length !== 1 ? 's' : ''} guardado{favoriteFilters.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Favorites List */}
            <div className="max-h-64 overflow-y-auto">
              {sortedFavorites.length > 0 ? (
                <div className="p-2">
                  {sortedFavorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      onClick={() => handleApplyFavorite(favorite.id)}
                      className="flex items-start gap-3 p-3 hover:bg-secondary-50 rounded-lg cursor-pointer group transition-colors"
                    >
                      <Star size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-secondary-900 truncate">{favorite.name}</h4>
                          <button
                            onClick={(e) => handleRemoveFavorite(favorite.id, favorite.name, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-secondary-500 truncate">
                          {getFilterSummary(favorite.filters)}
                        </p>
                        {favorite.description && (
                          <p className="text-xs text-secondary-600 mt-1 truncate">
                            {favorite.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-secondary-400">
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            {favorite.lastUsed ? formatDate(favorite.lastUsed) : formatDate(favorite.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={10} />
                            {favorite.useCount} uso{favorite.useCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-secondary-500">
                  <Star size={24} className="mx-auto mb-2 text-secondary-300" />
                  <p className="text-sm">No tienes filtros favoritos</p>
                  <p className="text-xs mt-1">Aplica filtros y guárdalos para acceso rápido</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Guardar Filtro Favorito
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Ej: Delanteros Premier League"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Descripción opcional..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div className="p-3 bg-secondary-50 rounded-lg">
                  <p className="text-sm text-secondary-600 mb-1">Filtros actuales:</p>
                  <p className="text-xs text-secondary-500">{getFilterSummary(currentFilters)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveFavorite}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FavoriteFiltersDropdown;