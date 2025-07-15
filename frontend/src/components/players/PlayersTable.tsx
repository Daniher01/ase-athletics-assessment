// src/components/players/PlayersTable.tsx
import React from 'react';
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, User } from 'lucide-react';
import { Player, PlayerFilters } from '../../services/playerService';

interface PlayersTableProps {
  players: Player[];
  loading: boolean;
  filters: PlayerFilters;
  onSort: (field: keyof PlayerFilters['sortBy'], order: 'asc' | 'desc') => void;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
  onView: (player: Player) => void;
}

const PlayersTable: React.FC<PlayersTableProps> = ({
  players,
  loading,
  filters,
  onSort,
  onEdit,
  onDelete,
  onView
}) => {
  const getSortIcon = (field: string) => {
    if (filters.sortBy === field) {
      return filters.sortOrder === 'asc' ? 
        <ChevronUp size={16} className="text-primary-500" /> : 
        <ChevronDown size={16} className="text-primary-500" />;
    }
    return <ChevronUp size={16} className="text-secondary-400" />;
  };

  const handleSort = (field: keyof PlayerFilters['sortBy']) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  };

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'forward':
        return 'bg-blue-100 text-blue-800';
      case 'midfielder':
        return 'bg-green-100 text-green-800';
      case 'defender':
        return 'bg-yellow-100 text-yellow-800';
      case 'goalkeeper':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-secondary-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-secondary-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-secondary-700"
                >
                  Jugador
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('age')}
                  className="flex items-center gap-1 hover:text-secondary-700"
                >
                  Edad
                  {getSortIcon('age')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('goals')}
                  className="flex items-center gap-1 hover:text-secondary-700"
                >
                  Goles
                  {getSortIcon('goals')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('assists')}
                  className="flex items-center gap-1 hover:text-secondary-700"
                >
                  Asistencias
                  {getSortIcon('assists')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('marketValue')}
                  className="flex items-center gap-1 hover:text-secondary-700"
                >
                  Valor
                  {getSortIcon('marketValue')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-secondary-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {player.imageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={player.imageUrl}
                          alt={player.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary-200 flex items-center justify-center">
                          <User size={20} className="text-secondary-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {player.name}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {player.nationality}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(player.position)}`}>
                    {player.position}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {player.age}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {player.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  <div className="flex items-center">
                    <span className="font-medium">{player.stats.goals}</span>
                    <span className="text-secondary-500 ml-1">({player.stats.appearances})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {player.stats.assists}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {player.marketValue ? formatCompactNumber(player.marketValue) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(player)}
                      className="text-primary-600 hover:text-primary-700 p-1 rounded"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(player)}
                      className="text-secondary-600 hover:text-secondary-700 p-1 rounded"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(player)}
                      className="text-red-600 hover:text-red-700 p-1 rounded"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {players.length === 0 && (
        <div className="text-center py-12">
          <User size={48} className="text-secondary-400 mx-auto mb-4" />
          <p className="text-secondary-500">No se encontraron jugadores</p>
        </div>
      )}
    </div>
  );
};

export default PlayersTable;