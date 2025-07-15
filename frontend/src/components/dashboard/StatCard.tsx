// src/components/dashboard/StatCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = 'primary'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary-50 text-primary-600 border-primary-200';
      case 'secondary':
        return 'bg-secondary-50 text-secondary-600 border-secondary-200';
      case 'success':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'danger':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-primary-50 text-primary-600 border-primary-200';
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-secondary-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              <span className="font-medium">
                {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
                {Math.abs(change.value)}%
              </span>
              <span className="ml-1 text-secondary-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses()}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;