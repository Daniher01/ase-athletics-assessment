// src/components/players/PlayerStats.tsx
import React from 'react';
import { Target, Users, TrendingUp, Award } from 'lucide-react';
import { Player } from '../../services/playerService';

interface PlayerStatsProps {
  player: Player;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  // Calcular estadísticas derivadas
  const goalsPerGame = player.appearances > 0 ? (player.goals / player.appearances) : 0;
  const assistsPerGame = player.appearances > 0 ? (player.assists / player.appearances) : 0;
  const contributionsPerGame = goalsPerGame + assistsPerGame;

  const stats = [
    {
      label: 'Goles',
      value: player.goals,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Asistencias',
      value: player.assists,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Partidos',
      value: player.appearances,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Goles/Partido',
      value: goalsPerGame.toFixed(2),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Estadísticas de Rendimiento
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="font-medium text-secondary-700">{stat.label}</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <h4 className="font-medium text-secondary-900 mb-3">Métricas Adicionales</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600">Asistencias por partido</span>
            <span className="font-medium text-secondary-900">{assistsPerGame.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600">Contribuciones por partido</span>
            <span className="font-medium text-secondary-900">{contributionsPerGame.toFixed(2)}</span>
          </div>
          {player.goals > 0 && player.assists > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-secondary-600">Ratio Goles/Asistencias</span>
              <span className="font-medium text-secondary-900">
                {(player.goals / player.assists).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;