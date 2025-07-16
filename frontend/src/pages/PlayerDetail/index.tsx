// src/pages/PlayerDetail/index.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  User,
  AlertCircle
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import PlayerAttributes from '../../components/players/PlayerAttributes';
import PlayerStats from '../../components/players/PlayerStats';
import ContractInfo from '../../components/players/ContractInfo';
import { playerService, Player } from '../../services/playerService';

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlayer(parseInt(id));
    }
  }, [id]);

  const loadPlayer = async (playerId: number) => {
    try {
      setLoading(true);
      setError(null);
      const playerData = await playerService.getPlayerById(playerId);
      setPlayer(playerData);
    } catch (err) {
      setError('Error al cargar la información del jugador');
      console.error('Error loading player:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: Implementar navegación a página de edición
    console.log('Edit player:', player?.id);
  };

  const handleDelete = () => {
    // TODO: Implementar modal de confirmación y eliminación
    console.log('Delete player:', player?.id);
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
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-secondary-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-secondary-200 rounded w-48 mb-4"></div>
                  <div className="h-4 bg-secondary-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-secondary-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !player) {
    return (
      <Layout>
        <div className="p-6">
          <button
            onClick={() => navigate('/players')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={20} />
            Volver a jugadores
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-medium text-red-800">Error al cargar jugador</h3>
              <p className="text-red-600 text-sm mt-1">
                {error || 'Jugador no encontrado'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/players')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          Volver a jugadores
        </button>

       {/* Player Header */}
{/* Player Header */}
<div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 md:p-6 mb-6">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 flex-1">
      {/* Player Image */}
      <div className="flex-shrink-0 mx-auto sm:mx-0">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-secondary-200"
          />
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-secondary-200 border-4 border-secondary-300 flex items-center justify-center">
            <User size={48} className="text-secondary-500" />
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">{player.name}</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPositionColor(player.position)} inline-block`}>
            {player.position}
          </span>
        </div>

        {/* Player Details - Stack on mobile, grid on larger screens */}
{/* Player Details - 2 rows of 2 columns */}
<div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2 text-sm mb-4">
  <div className="flex items-center justify-center sm:justify-start gap-2">
    <Calendar size={16} className="text-secondary-500" />
    <span className="text-secondary-600">Edad:</span>
    <span className="font-medium text-secondary-900">{player.age} años</span>
  </div>
  
  <div className="flex items-center justify-center sm:justify-start gap-2">
    <Users size={16} className="text-secondary-500" />
    <span className="text-secondary-600">Equipo:</span>
    <span className="font-medium text-secondary-900">{player.team}</span>
  </div>
  
  <div className="flex items-center justify-center sm:justify-start gap-2">
    <MapPin size={16} className="text-secondary-500" />
    <span className="text-secondary-600">Nacionalidad:</span>
    <span className="font-medium text-secondary-900">{player.nationality}</span>
  </div>
  
  <div className="flex items-center justify-center sm:justify-start gap-2">
    <TrendingUp size={16} className="text-secondary-500" />
    <span className="text-secondary-600">Valor:</span>
    <span className="font-medium text-secondary-900">
      {formatCompactNumber(player.marketValue)}
    </span>
  </div>
</div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-secondary-200">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary-600">{player.goals}</div>
            <div className="text-xs sm:text-sm text-secondary-600">Goles</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{player.assists}</div>
            <div className="text-xs sm:text-sm text-secondary-600">Asistencias</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-secondary-600">{player.appearances}</div>
            <div className="text-xs sm:text-sm text-secondary-600">Partidos</div>
          </div>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2 justify-center lg:justify-end lg:flex-col lg:gap-1">
      <button
        onClick={handleEdit}
        className="flex items-center gap-2 px-3 py-2 text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
      >
        <Edit size={16} />
        <span className="hidden sm:inline">Editar</span>
      </button>
      <button
        onClick={handleDelete}
        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">Eliminar</span>
      </button>
    </div>
  </div>
</div>

        {/* Player Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Stats */}
          <div className="lg:col-span-1">
            <PlayerStats player={player} />
          </div>

          {/* Player Attributes */}
          <div className="lg:col-span-1">
            <PlayerAttributes player={player} />
          </div>

          {/* Contract & Physical Info */}
          <div className="lg:col-span-1 space-y-6">
            <ContractInfo player={player} />
            
            {/* Physical Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Información Física
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Altura</span>
                  <span className="font-medium text-secondary-900">{player.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Peso</span>
                  <span className="font-medium text-secondary-900">{player.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">IMC</span>
                  <span className="font-medium text-secondary-900">
                    {((player.weight / (player.height / 100)) / (player.height / 100)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerDetail;