// src/components/comparison/ComparisonTable.tsx
import React from 'react';
import { Player } from '../../services/playerService';

interface ComparisonTableProps {
  players: Player[];
  category: 'performance' | 'attributes' | 'market';
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ players, category }) => {
  
  // Definir métricas según categoría
  const getMetrics = () => {
    switch (category) {
      case 'performance':
        return [
          { key: 'goals', label: 'Goles', format: (value: number) => value.toString() },
          { key: 'assists', label: 'Asistencias', format: (value: number) => value.toString() },
          { key: 'appearances', label: 'Partidos', format: (value: number) => value.toString() },
          { key: 'age', label: 'Edad', format: (value: number) => `${value} años` },
          { 
            key: 'goalsPerGame', 
            label: 'Goles/Partido', 
            format: (value: number, player: Player) => {
              const goalsPerGame = player.appearances > 0 ? (player.goals / player.appearances).toFixed(2) : '0.00';
              return goalsPerGame;
            }
          },
          { 
            key: 'assistsPerGame', 
            label: 'Asist./Partido', 
            format: (value: number, player: Player) => {
              const assistsPerGame = player.appearances > 0 ? (player.assists / player.appearances).toFixed(2) : '0.00';
              return assistsPerGame;
            }
          },
        ];

      case 'attributes':
        return [
          { key: 'pace', label: 'Velocidad', format: (value: number, player: Player) => `${player.attributes.pace}/100` },
          { key: 'shooting', label: 'Tiro', format: (value: number, player: Player) => `${player.attributes.shooting}/100` },
          { key: 'passing', label: 'Pase', format: (value: number, player: Player) => `${player.attributes.passing}/100` },
          { key: 'dribbling', label: 'Regate', format: (value: number, player: Player) => `${player.attributes.dribbling}/100` },
          { key: 'defending', label: 'Defensa', format: (value: number, player: Player) => `${player.attributes.defending}/100` },
          { key: 'physical', label: 'Físico', format: (value: number, player: Player) => `${player.attributes.physical}/100` },
        ];

      case 'market':
        return [
          { 
            key: 'marketValue', 
            label: 'Valor de Mercado', 
            format: (value: number) => new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          },
          { 
            key: 'salary', 
            label: 'Salario', 
            format: (value: number) => new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value || 0)
          },
          { 
            key: 'contractEnd', 
            label: 'Fin de Contrato', 
            format: (value: string) => {
              if (!value) return 'N/A';
              // Formatear fecha para mostrar solo año
              const date = new Date(value);
              return date.getFullYear().toString();
            }
          },
          { 
            key: 'valuePerGoal', 
            label: 'Valor/Gol', 
            format: (value: number, player: Player) => {
              const valuePerGoal = player.goals > 0 ? player.marketValue / player.goals : 0;
              return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: 'compact',
                compactDisplay: 'short'
              }).format(valuePerGoal);
            }
          },
        ];

      default:
        return [];
    }
  };

  const metrics = getMetrics();

  // Función para obtener el mejor valor 
  const getBestValueIndex = (metricKey: string) => {
    const values = players.map(player => {
      if (metricKey === 'goalsPerGame') {
        return player.appearances > 0 ? player.goals / player.appearances : 0;
      }
      if (metricKey === 'assistsPerGame') {
        return player.appearances > 0 ? player.assists / player.appearances : 0;
      }
      if (metricKey === 'valuePerGoal') {
        return player.goals > 0 ? player.marketValue / player.goals : Infinity;
      }
      if (metricKey === 'pace') return player.attributes.pace;
      if (metricKey === 'shooting') return player.attributes.shooting;
      if (metricKey === 'passing') return player.attributes.passing;
      if (metricKey === 'dribbling') return player.attributes.dribbling;
      if (metricKey === 'defending') return player.attributes.defending;
      if (metricKey === 'physical') return player.attributes.physical;
      
      return (player as any)[metricKey] || 0;
    });

    // Para estas métricas, menor es mejor
    const lowerIsBetter = ['age', 'valuePerGoal'];
    
    if (lowerIsBetter.includes(metricKey)) {
      const minValue = Math.min(...values.filter(v => v !== Infinity));
      return values.indexOf(minValue);
    } else {
      const maxValue = Math.max(...values);
      return values.indexOf(maxValue);
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'performance': return 'Estadísticas de Rendimiento';
      case 'attributes': return 'Atributos Técnicos';
      case 'market': return 'Información de Mercado';
      default: return 'Comparación';
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Selecciona al menos 2 jugadores para comparar
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {getCategoryTitle()}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Los valores destacados indican el mejor rendimiento en cada métrica
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header con nombres de jugadores */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-gray-900 border-r border-gray-200">
                Métrica
              </th>
              {players.map((player, index) => (
                <th key={player.id} className="px-6 py-4 text-center font-medium text-gray-900 border-r border-gray-200 last:border-r-0">
                  <div className="space-y-1">
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-xs text-gray-600">{player.team}</div>
                    <div className="text-xs text-gray-500">{player.position}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body con métricas */}
          <tbody className="divide-y divide-gray-200">
            {metrics.map((metric, metricIndex) => {
              const bestIndex = getBestValueIndex(metric.key);
              
              return (
                <tr key={metric.key} className={metricIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                    {metric.label}
                  </td>
                  {players.map((player, playerIndex) => {
                    let value;
                    
                    // Obtener el valor correcto según la métrica
                    if (metric.key === 'pace') value = player.attributes.pace;
                    else if (metric.key === 'shooting') value = player.attributes.shooting;
                    else if (metric.key === 'passing') value = player.attributes.passing;
                    else if (metric.key === 'dribbling') value = player.attributes.dribbling;
                    else if (metric.key === 'defending') value = player.attributes.defending;
                    else if (metric.key === 'physical') value = player.attributes.physical;
                    else value = (player as any)[metric.key];
                    
                    const formattedValue = metric.format(value, player);
                    const isBest = playerIndex === bestIndex;
                    
                    return (
                      <td 
                        key={player.id} 
                        className={`px-6 py-4 text-center border-r border-gray-200 last:border-r-0 ${
                          isBest ? 'bg-green-50 font-semibold text-green-800' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {formattedValue}
                          {isBest && (
                            <span className="ml-2 text-green-600">★</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con resumen */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-50 border border-green-200 rounded mr-2"></span>
            <span>★ Mejor valor en cada métrica</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">Total de métricas: {metrics.length}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">Jugadores comparados: {players.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;