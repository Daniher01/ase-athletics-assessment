// src/pages/PlayerComparison/index.tsx
import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, BarChart3, Radar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { Player } from '../../types';
import { playerService } from '../../services/playerService';

type MetricCategory = 'performance' | 'attributes' | 'market';

const PlayerComparison: React.FC = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MetricCategory>('performance');
  const [error, setError] = useState<string | null>(null);

  // Cargar jugadores disponibles
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const response = await playerService.getPlayers({
          page: 1,
          limit: 100, // Cargar más jugadores para comparación
          search: '',
          filters: {}
        });
        setAvailablePlayers(response.players);
      } catch (err) {
        setError('Error al cargar jugadores');
        console.error('Error loading players:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Filtrar jugadores por búsqueda
  const filteredPlayers = (availablePlayers || []).filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar jugador a la comparación
  const addPlayer = (player: Player) => {
    if (selectedPlayers.length >= 4) {
      alert('Máximo 4 jugadores para comparar');
      return;
    }
    if (selectedPlayers.find(p => p.id === player.id)) {
      alert('Este jugador ya está seleccionado');
      return;
    }
    setSelectedPlayers([...selectedPlayers, player]);
  };

  // Remover jugador de la comparación
  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedPlayers([]);
  };

  const categories = [
    { key: 'performance' as MetricCategory, label: 'Rendimiento', icon: BarChart3 },
    { key: 'attributes' as MetricCategory, label: 'Atributos', icon: Radar },
    { key: 'market' as MetricCategory, label: 'Mercado', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/players"
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Volver a Jugadores
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Comparación de Jugadores
              </h1>
              <p className="text-gray-600 mt-1">
                Selecciona hasta 4 jugadores para comparar sus estadísticas
              </p>
            </div>
          </div>

          {selectedPlayers.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
            >
              Limpiar Selección
            </button>
          )}
        </div>

        {/* Jugadores Seleccionados */}
        {selectedPlayers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Jugadores Seleccionados ({selectedPlayers.length}/4)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedPlayers.map(player => (
                <div
                  key={player.id}
                  className="bg-white rounded-lg p-3 border border-blue-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.team}</div>
                    <div className="text-xs text-gray-500">{player.position}</div>
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorías de Métricas */}
        {selectedPlayers.length >= 2 && (
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeCategory === category.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedPlayers.length >= 2 ? (
          // Mostrar comparación
          <div className="space-y-6">
            {/* Aquí irán los componentes de comparación */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">
                Comparación - {categories.find(c => c.key === activeCategory)?.label}
              </h3>
              {/* TODO: Agregar componentes de comparación aquí */}
              <div className="text-center py-8 text-gray-500">
                Componentes de comparación se implementarán a continuación...
              </div>
            </div>
          </div>
        ) : (
          // Mostrar selector de jugadores
          <div>
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar jugadores por nombre, equipo o posición..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Lista de jugadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlayers.slice(0, 20).map(player => (
                <div
                  key={player.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => addPlayer(player)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{player.name}</h4>
                      <p className="text-sm text-gray-600">{player.team}</p>
                      <p className="text-xs text-gray-500">{player.position}</p>
                      
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Edad:</span>
                          <span>{player.age}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Goles:</span>
                          <span>{player.goals}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Valor:</span>
                          <span>
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                              notation: 'compact',
                              compactDisplay: 'short'
                            }).format(player.marketValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-2">
                      <button className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron jugadores que coincidan con la búsqueda
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlayerComparison;