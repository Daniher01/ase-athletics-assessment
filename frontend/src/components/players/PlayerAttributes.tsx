// src/components/players/PlayerAttributes.tsx
import React from 'react';
import { Player } from '../../services/playerService';

interface PlayerAttributesProps {
  player: Player;
}

const PlayerAttributes: React.FC<PlayerAttributesProps> = ({ player }) => {
  const { attributes } = player;

  // Definir los atributos principales según la posición
  const getMainAttributes = () => {
    const isGoalkeeper = player.position.toLowerCase().includes('goalkeeper');
    
    if (isGoalkeeper) {
      return [
        { name: 'Paradas', value: attributes.diving || 0, max: 100 },
        { name: 'Manejo', value: attributes.handling || 0, max: 100 },
        { name: 'Patadas', value: attributes.kicking || 0, max: 100 },
        { name: 'Reflejos', value: attributes.reflexes || 0, max: 100 },
        { name: 'Posicionamiento', value: attributes.positioning || 0, max: 100 },
        { name: 'Físico', value: attributes.physical, max: 100 }
      ];
    } else {
      return [
        { name: 'Ritmo', value: attributes.pace, max: 100 },
        { name: 'Tiro', value: attributes.shooting, max: 100 },
        { name: 'Pase', value: attributes.passing, max: 100 },
        { name: 'Regate', value: attributes.dribbling, max: 100 },
        { name: 'Defensa', value: attributes.defending, max: 100 },
        { name: 'Físico', value: attributes.physical, max: 100 }
      ];
    }
  };

  const mainAttributes = getMainAttributes();

  // Función para obtener color basado en el valor
  const getAttributeColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 70) return 'bg-blue-500';
    if (value >= 60) return 'bg-yellow-500';
    if (value >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAttributeTextColor = (value: number) => {
    if (value >= 80) return 'text-green-700';
    if (value >= 70) return 'text-blue-700';
    if (value >= 60) return 'text-yellow-700';
    if (value >= 50) return 'text-orange-700';
    return 'text-red-700';
  };

  // Calcular promedio general
  const averageRating = Math.round(
    mainAttributes.reduce((sum, attr) => sum + attr.value, 0) / mainAttributes.length
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">Atributos</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{averageRating}</div>
          <div className="text-xs text-secondary-500">Promedio</div>
        </div>
      </div>

      <div className="space-y-4">
        {mainAttributes.map((attribute, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-secondary-700">
                {attribute.name}
              </span>
              <span className={`text-sm font-bold ${getAttributeTextColor(attribute.value)}`}>
                {attribute.value}
              </span>
            </div>
            
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getAttributeColor(attribute.value)}`}
                style={{ width: `${(attribute.value / attribute.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Atributos técnicos adicionales para jugadores de campo */}
      {!player.position.toLowerCase().includes('goalkeeper') && (
        <div className="mt-6 pt-4 border-t border-secondary-200">
          <h4 className="font-medium text-secondary-900 mb-3">Atributos Técnicos</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {attributes.finishing && (
              <div className="flex justify-between">
                <span className="text-secondary-600">Definición</span>
                <span className={`font-medium ${getAttributeTextColor(attributes.finishing)}`}>
                  {attributes.finishing}
                </span>
              </div>
            )}
            {attributes.crossing && (
              <div className="flex justify-between">
                <span className="text-secondary-600">Centros</span>
                <span className={`font-medium ${getAttributeTextColor(attributes.crossing)}`}>
                  {attributes.crossing}
                </span>
              </div>
            )}
            {attributes.longShots && (
              <div className="flex justify-between">
                <span className="text-secondary-600">Tiros Lejanos</span>
                <span className={`font-medium ${getAttributeTextColor(attributes.longShots)}`}>
                  {attributes.longShots}
                </span>
              </div>
            )}
            {attributes.positioning && (
              <div className="flex justify-between">
                <span className="text-secondary-600">Posicionamiento</span>
                <span className={`font-medium ${getAttributeTextColor(attributes.positioning)}`}>
                  {attributes.positioning}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerAttributes;