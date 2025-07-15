// src/components/dashboard/PositionChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PositionDistribution } from '../../services/dashboardService';

interface PositionChartProps {
  data: PositionDistribution[];
  loading?: boolean;
}

const PositionChart: React.FC<PositionChartProps> = ({ data, loading }) => {
  // Filtrar solo las posiciones principales para el gráfico
  const mainPositions = data.filter(item => 
    ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'].includes(item.position)
  );

  // Colores para cada posición
  const COLORS = {
    'Forward': '#0ea5e9',      // primary-500
    'Midfielder': '#10b981',   // green-500
    'Defender': '#f59e0b',     // yellow-500
    'Goalkeeper': '#ef4444'    // red-500
  };

  const getColor = (position: string) => {
    return COLORS[position as keyof typeof COLORS] || '#64748b';
  };

  // Calcular datos para el gráfico con porcentajes
  const totalMainPositions = mainPositions.reduce((sum, item) => sum + item.count, 0);
  const chartData = mainPositions.map(item => ({
    ...item,
    percentage: (item.count / totalMainPositions) * 100
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-secondary-200 rounded-lg shadow-lg">
          <p className="font-medium text-secondary-900">{data.position}</p>
          <p className="text-sm text-secondary-600">
            {data.count} jugadores ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-xs text-secondary-500">
            Edad promedio: {data.avgAge.toFixed(1)} años
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-secondary-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Distribución por Posición
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        Distribución por Posición
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.position)} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PositionChart;