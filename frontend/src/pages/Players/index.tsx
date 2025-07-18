// src/pages/Players/index.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2 } from 'lucide-react';
import Layout from '../../components/common/Layout';
import PlayersTable from '../../components/players/PlayersTable';
import PlayersFilters from '../../components/players/PlayersFilters';
import PlayerForm from '../../components/players/PlayerForm';
import Pagination from '../../components/common/Pagination';
import { 
  playerService, 
  Player, 
  PlayerFilters,
  PlayersResponse 
} from '../../services/playerService';

const PlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<PlayerFilters>({
    sortBy: 'name',
    sortOrder: 'asc' as const
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Datos para filtros
  const [teams, setTeams] = useState<string[]>([]);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  
  // Estados para modales
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadFilterData();
  }, []);

  // Cargar jugadores cuando cambian filtros o paginación
  useEffect(() => {
    loadPlayers();
  }, [pagination.page, pagination.limit, filters]);

  const loadFilterData = async () => {
    try {
      const [teamsData, nationalitiesData, positionsData] = await Promise.all([
        playerService.getTeams().catch(() => []),
        playerService.getNationalities().catch(() => []),
        playerService.getPositions().catch(() => [])
      ]);
      
      setTeams(teamsData);
      setNationalities(nationalitiesData);
      setPositions(positionsData);
    } catch (err) {
      console.error('Error loading filter data:', err);
      // Valores por defecto si falla
      setTeams([]);
      setNationalities([]);
      setPositions([]);
    }
  };

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PlayersResponse = await playerService.getPlayers(
        pagination.page,
        pagination.limit,
        filters
      );
      
      setPlayers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages
      }));
    } catch (err) {
      setError('Error al cargar los jugadores');
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: PlayerFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); 
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: keyof PlayerFilters['sortBy'], order: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: order
    }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleItemsPerPageChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleViewPlayer = (player: Player) => {
    navigate(`/players/${player.id}`);
  };

  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = (player: Player) => {
    setPlayerToDelete(player);
    setShowDeleteModal(true);
  };

  const handleAddPlayer = () => {
    setPlayerToEdit(null);
    setShowPlayerForm(true);
  };

  const handleSavePlayer = async (playerData: any) => {
    try {
      setFormLoading(true);
      
      if (playerToEdit) {
        // Actualizar jugador existente
        await playerService.updatePlayer(playerToEdit.id, playerData);
      } else {
        // Crear nuevo jugador
        await playerService.createPlayer(playerData);
      }
      
      // Recargar lista de jugadores
      await loadPlayers();
      setShowPlayerForm(false);
      setPlayerToEdit(null);
    } catch (err) {
      console.error('Error saving player:', err);
      setError('Error al guardar el jugador');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      await playerService.deletePlayer(playerToDelete.id);
      setShowDeleteModal(false);
      setPlayerToDelete(null);
      loadPlayers(); // Recargar lista
    } catch (err) {
      console.error('Error deleting player:', err);
      setError('Error al eliminar el jugador');
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-medium text-red-800">Error al cargar jugadores</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={loadPlayers}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Jugadores</h1>
          <p className="text-secondary-600">
            Gestiona y visualiza información de jugadores
          </p>
        </div>

        {/* Filters */}
        <PlayersFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onAddPlayer={handleAddPlayer}
          teams={teams}
          nationalities={nationalities}
          positions={positions}
          players={players}
          loading={loading}
        />

        {/* Players Table */}
        <PlayersTable
          players={players}
          loading={loading}
          filters={filters}
          onSort={handleSort}
          onEdit={handleEditPlayer}
          onDelete={handleDeletePlayer}
          onView={handleViewPlayer}
        />

        {/* Pagination */}
        {!loading && players.length > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}

        {/* Player Form Modal */}
        <PlayerForm
          player={playerToEdit}
          isOpen={showPlayerForm}
          onClose={() => {
            setShowPlayerForm(false);
            setPlayerToEdit(null);
          }}
          onSave={handleSavePlayer}
          loading={formLoading}
          teams={teams}
          nationalities={nationalities}
          positions={positions}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && playerToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="text-red-600" size={24} />
                <h3 className="text-lg font-semibold text-secondary-900">
                  Eliminar Jugador
                </h3>
              </div>
              
              <p className="text-secondary-600 mb-6">
                ¿Estás seguro de que quieres eliminar a <strong>{playerToDelete.name}</strong>? 
                Esta acción no se puede deshacer.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeletePlayer}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlayersPage;