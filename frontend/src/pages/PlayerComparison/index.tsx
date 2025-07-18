// src/pages/PlayerComparison/index.tsx
import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, BarChart3, Radar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import ComparisonTable from '../../components/comparison/ComparisonTable';
import RadarComparison from '../../components/comparison/RadarComparison';
import ComparisonExport from '../../components/comparison/ComparisonExport';
import { Player, playerService } from '../../services/playerService';

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
        console.log('🔍 Iniciando carga de jugadores...');
        setLoading(true);
        setError(null);
        
        // Llamada corregida al servicio - parámetros individuales
        const response = await playerService.getPlayers(
          1,    // page
          100,  // limit - más jugadores para la selección
          {}    // filters vacío
        );
        
        console.log('✅ Respuesta del API:', response);
        console.log('📊 Jugadores cargados:', response.data?.length);
        
        if (response && response.data) {
          setAvailablePlayers(response.data); // Usar response.data en lugar de response.players
        } else {
          console.warn('⚠️ No se encontraron jugadores en la respuesta');
          setAvailablePlayers([]);
        }
      } catch (err) {
        console.error('❌ Error loading players:', err);
        setError('Error al cargar jugadores: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Listener para cambios de categoría desde PDF export
  useEffect(() => {
    const handleCategoryChange = (event: CustomEvent) => {
      const { category } = event.detail;
      setActiveCategory(category);
    };

    window.addEventListener('changeCategoryForPDF', handleCategoryChange as EventListener);
    
    return () => {
      window.removeEventListener('changeCategoryForPDF', handleCategoryChange as EventListener);
    };
  }, []);

  // Filtrar jugadores por búsqueda
  const filteredPlayers = availablePlayers.filter(player =>
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

          <div className="flex items-center space-x-3">
            {/* Botón de exportación */}
            {selectedPlayers.length >= 2 && (
              <ComparisonExport 
                players={selectedPlayers} 
                activeCategory={activeCategory} 
              />
            )}
            
            {/* Botón limpiar selección */}
            {selectedPlayers.length > 0 && (
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
              >
                Limpiar Selección
              </button>
            )}
          </div>
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
                    className="text-red-500 hover:text-red-700 ml-2 text-lg font-bold"
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

        {/* Mostrar comparación si hay 2 o más jugadores */}
        {selectedPlayers.length >= 2 && (
          <div className="space-y-6 mb-8" data-comparison-container>
            {activeCategory === 'attributes' ? (
              <RadarComparison players={selectedPlayers} />
            ) : (
              <ComparisonTable 
                players={selectedPlayers} 
                category={activeCategory} 
              />
            )}
          </div>
        )}

        {/* Mostrar selector de jugadores (siempre visible si hay menos de 4 jugadores) */}
        {selectedPlayers.length < 4 && (
          <div>
            {/* Título dinámico para la sección de selección */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedPlayers.length === 0 
                  ? 'Selecciona jugadores para comparar' 
                  : `Agregar más jugadores (${selectedPlayers.length}/4 seleccionados)`
                }
              </h3>
            
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
                {filteredPlayers.slice(0, 20).map(player => {
                  const isSelected = selectedPlayers.find(p => p.id === player.id);
                  
                  return (
                    <div
                      key={player.id}
                      className={`bg-white rounded-lg border p-4 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 opacity-60' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => !isSelected && addPlayer(player)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                            {player.name}
                          </h4>
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
                          {isSelected ? (
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                              ✓
                            </div>
                          ) : (
                            <button className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                              +
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredPlayers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron jugadores que coincidan con la búsqueda
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="text-red-800">{error}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlayerComparison;