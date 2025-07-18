// src/components/dashboard/MarketTrendChart.tsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

interface MarketRange {
  range: string;
  count: number;
  percentage: number;
  avgValue: number;
  color: string;
}

interface MarketTrendChartProps {
  data: any[]; // Los datos de jugadores desde el dashboard
}

const MarketTrendChart: React.FC<MarketTrendChartProps> = ({ data }) => {
  
  // Generar rangos de valor de mercado
  const generateMarketRanges = (): MarketRange[] => {
    if (!data || data.length === 0) return [];

    // Definir rangos de valores (en millones de euros)
    const ranges = [
      { min: 0, max: 1000000, label: '0-1M', color: '#ef4444' },
      { min: 1000000, max: 5000000, label: '1-5M', color: '#f97316' },
      { min: 5000000, max: 10000000, label: '5-10M', color: '#f59e0b' },
      { min: 10000000, max: 25000000, label: '10-25M', color: '#10b981' },
      { min: 25000000, max: 50000000, label: '25-50M', color: '#0ea5e9' },
      { min: 50000000, max: Infinity, label: '50M+', color: '#8b5cf6' }
    ];

    // Calcular distribución
    const distribution = ranges.map(range => {
      const playersInRange = data.filter(player => {
        const value = player.marketValue || player.avgMarketValue || 0;
        return value >= range.min && value < range.max;
      });

      const avgValue = playersInRange.length > 0 
        ? playersInRange.reduce((acc, player) => acc + (player.marketValue || player.avgMarketValue || 0), 0) / playersInRange.length
        : 0;

      return {
        range: range.label,
        count: playersInRange.length,
        percentage: (playersInRange.length / data.length) * 100,
        avgValue,
        color: range.color
      };
    }).filter(item => item.count > 0); // Solo mostrar rangos con jugadores

    return distribution;
  };

  const marketRanges = generateMarketRanges();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{data.count}</span> jugadores ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-sm text-gray-600">
            Valor promedio: <span className="font-medium">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: 'compact',
                compactDisplay: 'short'
              }).format(data.avgValue)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0 || marketRanges.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <TrendingUp className="h-8 w-8 mr-2" />
          <span>No hay datos de valor de mercado disponibles</span>
        </div>
      </div>
    );
  }

  const totalPlayers = marketRanges.reduce((acc, item) => acc + item.count, 0);
  const averageValue = data.reduce((acc, player) => acc + (player.marketValue || player.avgMarketValue || 0), 0) / data.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Distribución de Valor de Mercado
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {marketRanges.length} rangos
          </span>
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={marketRanges}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="range" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#9ca3af' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#9ca3af' }}
              label={{ value: 'Jugadores', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {marketRanges.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas Resumidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="font-medium text-gray-900">{totalPlayers}</div>
          <div className="text-xs text-gray-500">Total Jugadores</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(averageValue)}
          </div>
          <div className="text-xs text-gray-500">Valor Promedio</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {marketRanges.find(r => r.count === Math.max(...marketRanges.map(r => r.count)))?.range || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Rango Más Común</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-gray-900">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(Math.max(...data.map(player => player.marketValue || player.avgMarketValue || 0)))}
          </div>
          <div className="text-xs text-gray-500">Valor Máximo</div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="mt-4 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap gap-3 justify-center">
          {marketRanges.map((range) => (
            <div key={range.range} className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: range.color }}
              ></div>
              <span className="text-xs text-gray-600">
                {range.range} ({range.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketTrendChart;