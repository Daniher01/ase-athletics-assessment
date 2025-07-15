// src/components/dashboard/TopScorers.tsx
import React from 'react';
import { Trophy, Target, Users } from 'lucide-react';
import { TopPlayer } from '../../services/dashboardService';

interface TopScorersProps {
  data: TopPlayer[];
  loading?: boolean;
}

const TopScorers: React.FC<TopScorersProps> = ({ data, loading }) => {
  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 1:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy size={16} className="text-yellow-600" />;
    return <span className="text-sm font-bold">#{index + 1}</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Top Goleadores
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-secondary-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-secondary-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Top Goleadores
      </h3>
      <div className="space-y-3">
        {data.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
          >
            {/* Rank */}
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${getRankColor(index)}`}>
              {getRankIcon(index)}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-secondary-900">{player.name}</h4>
                <span className="text-sm text-secondary-600">•</span>
                <span className="text-sm text-secondary-600">{player.team}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary-600">
                <div className="flex items-center gap-1">
                  <Target size={12} />
                  <span>{player.goals || 0} goles</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{player.position}</span>
                </div>
              </div>
            </div>

            {/* Goals Count */}
            <div className="text-right">
              <div className="text-xl font-bold text-primary-600">{player.goals || 0}</div>
              <div className="text-xs text-secondary-500">goles</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopScorers;