// src/components/comparison/RadarComparison.tsx
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Player } from '../../services/playerService';

interface RadarComparisonProps {
  players: Player[];
}

const RadarComparison: React.FC<RadarComparisonProps> = ({ players }) => {
  // Colores para cada jugador (usando los colores de tu design system)
  const playerColors = [
    '#0ea5e9', // blue-500
    '#10b981', // green-500
    '#f59e0b', // yellow-500
    '#ef4444', // red-500
  ];

  // Definir los atributos que vamos a comparar
  const attributes = [
    { key: 'pace', label: 'Velocidad', fullMark: 100 },
    { key: 'shooting', label: 'Tiro', fullMark: 100 },
    { key: 'passing', label: 'Pase', fullMark: 100 },
    { key: 'dribbling', label: 'Regate', fullMark: 100 },
    { key: 'defending', label: 'Defensa', fullMark: 100 },
    { key: 'physical', label: 'Físico', fullMark: 100 },
  ];

  // Transformar datos para Recharts
  const radarData = attributes.map(attr => {
    const dataPoint: any = {
      attribute: attr.label,
      fullMark: attr.fullMark,
    };

    // Agregar el valor de cada jugador para este atributo
    players.forEach((player, index) => {
      const playerKey = `player${index}`;
      dataPoint[playerKey] = player.attributes[attr.key as keyof typeof player.attributes] || 0;
    });

    return dataPoint;
  });

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey.startsWith('player')) {
              const playerIndex = parseInt(entry.dataKey.replace('player', ''));
              const player = players[playerIndex];
              return (
                <p key={index} style={{ color: entry.color }} className="text-sm">
                  <span className="font-medium">{player?.name}:</span> {entry.value}/100
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  // Leyenda personalizada
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => {
          if (entry.dataKey?.startsWith('player')) {
            const playerIndex = parseInt(entry.dataKey.replace('player', ''));
            const player = players[playerIndex];
            return (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {player?.name}
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // Calcular estadísticas promedio para cada jugador
  const getPlayerAverage = (player: Player) => {
    const attrs = [
      player.attributes.pace,
      player.attributes.shooting,
      player.attributes.passing,
      player.attributes.dribbling,
      player.attributes.defending,
      player.attributes.physical,
    ];
    return (attrs.reduce((sum, val) => sum + (val || 0), 0) / attrs.length).toFixed(1);
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecciona al menos un jugador para ver la comparación de atributos
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Comparación de Atributos - Radar
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Visualización radial de las habilidades técnicas de cada jugador
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((player, index) => (
            <div key={player.id} className="text-center">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-1" 
                style={{ backgroundColor: playerColors[index] }}
              ></div>
              <div className="text-sm font-medium text-gray-900">{player.name}</div>
              <div className="text-xs text-gray-600">{player.position}</div>
              <div className="text-sm font-semibold text-gray-800">
                {getPlayerAverage(player)} <span className="text-xs text-gray-500">avg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico Radar */}
      <div className="p-6">
        <div className="w-full" style={{ height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 40, right: 80, bottom: 40, left: 80 }}>
              <PolarGrid 
                gridType="polygon" 
                radialLines={true}
                stroke="#e5e7eb"
              />
              <PolarAngleAxis 
                dataKey="attribute" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickCount={6}
              />
              
              {/* Crear un Radar por cada jugador */}
              {players.map((player, index) => (
                <Radar
                  key={player.id}
                  name={player.name}
                  dataKey={`player${index}`}
                  stroke={playerColors[index]}
                  fill={playerColors[index]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ r: 4, fill: playerColors[index] }}
                />
              ))}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis rápido */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Análisis Rápido</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Mejor en cada atributo */}
          {attributes.map(attr => {
            const bestPlayer = players.reduce((best, current) => {
              const currentValue = current.attributes[attr.key as keyof typeof current.attributes] || 0;
              const bestValue = best.attributes[attr.key as keyof typeof best.attributes] || 0;
              return currentValue > bestValue ? current : best;
            });
            
            const bestValue = bestPlayer.attributes[attr.key as keyof typeof bestPlayer.attributes];
            
            return (
              <div key={attr.key} className="flex justify-between items-center py-1">
                <span className="text-gray-600">Mejor en {attr.label}:</span>
                <span className="font-medium text-gray-900">
                  {bestPlayer.name} ({bestValue}/100)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-200 rounded mr-2"></span>
            <span>Escala: 0-100 puntos por atributo</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">Jugadores comparados: {players.length}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">Hover para valores exactos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarComparison;