// src/components/dashboard/AttributesRadar.tsx
import React, { useState } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Activity, Users, Filter } from 'lucide-react';
import { AttributesByPosition } from '../../services/dashboardService';

interface AttributesRadarProps {
  data: AttributesByPosition[];
}

const AttributesRadar: React.FC<AttributesRadarProps> = ({ data }) => {
  // ✅ AGRUPAR por posiciones generales como en PositionChart
  const groupDataByGeneralPosition = () => {
    const generalPositions = {
      'Forward': [] as AttributesByPosition[],
      'Midfielder': [] as AttributesByPosition[],
      'Defender': [] as AttributesByPosition[],
      'Goalkeeper': [] as AttributesByPosition[]
    };

    data.forEach(item => {
      if (['Forward', 'Midfielder', 'Defender', 'Goalkeeper'].includes(item.position)) {
        generalPositions[item.position as keyof typeof generalPositions].push(item);
      } else {
        // Agrupar posiciones específicas en generales
        if (item.position.includes('Forward') || item.position.includes('Striker') || item.position.includes('Winger')) {
          generalPositions.Forward.push(item);
        } else if (item.position.includes('Midfielder') || item.position.includes('Midfield')) {
          generalPositions.Midfielder.push(item);
        } else if (item.position.includes('Defender') || item.position.includes('Back')) {
          generalPositions.Defender.push(item);
        } else if (item.position.includes('Goalkeeper') || item.position.includes('Keeper')) {
          generalPositions.Goalkeeper.push(item);
        }
      }
    });

    // Calcular promedios para cada posición general
    return Object.entries(generalPositions).map(([position, players]) => {
      if (players.length === 0) return null;

      const totalPlayers = players.reduce((acc, player) => acc + player.playerCount, 0);
      
      const avgAttributes = {
        Pace: Math.round(players.reduce((acc, player) => acc + (player.attributes.Pace * player.playerCount), 0) / totalPlayers),
        Shooting: Math.round(players.reduce((acc, player) => acc + (player.attributes.Shooting * player.playerCount), 0) / totalPlayers),
        Passing: Math.round(players.reduce((acc, player) => acc + (player.attributes.Passing * player.playerCount), 0) / totalPlayers),
        Dribbling: Math.round(players.reduce((acc, player) => acc + (player.attributes.Dribbling * player.playerCount), 0) / totalPlayers),
        Defending: Math.round(players.reduce((acc, player) => acc + (player.attributes.Defending * player.playerCount), 0) / totalPlayers),
        Physicality: Math.round(players.reduce((acc, player) => acc + (player.attributes.Physicality * player.playerCount), 0) / totalPlayers)
      };

      return {
        position,
        playerCount: totalPlayers,
        attributes: avgAttributes
      };
    }).filter(Boolean) as AttributesByPosition[];
  };

  const groupedData = groupDataByGeneralPosition();
  
  // ✅ VOLVER a mostrar todas las posiciones por defecto (ahora son solo 4 máximo)
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true); // ✅ Cambiar de vuelta a true

  // Colores para diferentes posiciones
  const positionColors = {
    'Forward': '#ef4444',      // Rojo
    'Midfielder': '#0ea5e9',   // Azul
    'Defender': '#10b981',     // Verde
    'Goalkeeper': '#f59e0b',   // Amarillo
    'Winger': '#8b5cf6',       // Púrpura
    'Attacking Midfielder': '#f97316', // Naranja
    'Defensive Midfielder': '#06b6d4'  // Cian
  };

  // Preparar datos para el radar usando datos agrupados
  const prepareRadarData = () => {
    if (!groupedData || groupedData.length === 0) return [];

    // Obtener todas las métricas disponibles
    const attributes = ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physicality'];
    
    // Crear estructura de datos para el radar
    return attributes.map(attribute => {
      const attributeData: any = { attribute };
      
      // Filtrar posiciones a mostrar
      const positionsToShow = showAll 
        ? groupedData 
        : groupedData.filter(item => selectedPositions.includes(item.position));

      positionsToShow.forEach(item => {
        attributeData[item.position] = item.attributes[attribute as keyof typeof item.attributes];
      });

      return attributeData;
    });
  };

  // Manejar selección de posiciones usando datos agrupados
  const handlePositionToggle = (position: string) => {
    if (selectedPositions.includes(position)) {
      setSelectedPositions(selectedPositions.filter(p => p !== position));
    } else {
      setSelectedPositions([...selectedPositions, position]);
    }
    setShowAll(false);
  };

  const handleShowAll = () => {
    setShowAll(true);
    setSelectedPositions([]);
  };

  const radarData = prepareRadarData();
  const positionsToDisplay = showAll 
    ? groupedData 
    : groupedData.filter(item => selectedPositions.includes(item.position));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              <span className="font-medium">{entry.dataKey}:</span> {entry.value}/100
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0 || groupedData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <Activity className="h-8 w-8 mr-2" />
          <span>No hay datos de atributos disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Atributos por Posición
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {positionsToDisplay.length} posición{positionsToDisplay.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={handleShowAll}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              showAll 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Todas las posiciones
          </button>
          {groupedData.map((item) => (
            <button
              key={item.position}
              onClick={() => handlePositionToggle(item.position)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPositions.includes(item.position)
                  ? 'text-white border' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedPositions.includes(item.position) 
                  ? positionColors[item.position as keyof typeof positionColors] || '#6b7280'
                  : undefined,
                borderColor: selectedPositions.includes(item.position)
                  ? positionColors[item.position as keyof typeof positionColors] || '#6b7280'
                  : undefined
              }}
            >
              {item.position}
              <span className="ml-1 text-xs opacity-75">
                ({item.playerCount})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de Radar */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="attribute" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            
            {positionsToDisplay.map((item, index) => (
              <Radar
                key={item.position}
                name={`${item.position} (${item.playerCount})`}
                dataKey={item.position}
                stroke={positionColors[item.position as keyof typeof positionColors] || '#6b7280'}
                fill={positionColors[item.position as keyof typeof positionColors] || '#6b7280'}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ r: 4, fill: positionColors[item.position as keyof typeof positionColors] || '#6b7280' }}
              />
            ))}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas Resumidas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {groupedData.reduce((acc, item) => acc + item.playerCount, 0)}
            </div>
            <div className="text-gray-500">Total Jugadores</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {groupedData.length}
            </div>
            <div className="text-gray-500">Posiciones</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {positionsToDisplay.length}
            </div>
            <div className="text-gray-500">Mostrando</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributesRadar;