// src/components/dashboard/PerformanceStats.tsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { Target, TrendingUp, Award, Activity } from 'lucide-react';

interface PerformanceData {
  position: string;
  count: number;
  avgAge: number;
  avgGoals: number;
  avgAssists: number;
  avgMarketValue: number;
}

interface PerformanceStatsProps {
  data: PerformanceData[];
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ data }) => {
  
  // Calcular métricas de rendimiento
  const calculatePerformanceMetrics = () => {
    if (!data || data.length === 0) return [];

    return data.map(position => {
      // Filtrar solo posiciones principales
      const isMainPosition = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'].includes(position.position);
      if (!isMainPosition) return null;

      const goalsPerGame = position.avgGoals > 0 ? (position.avgGoals / 38).toFixed(2) : '0.00'; // Asumiendo 38 partidos por temporada
      const assistsPerGame = position.avgAssists > 0 ? (position.avgAssists / 38).toFixed(2) : '0.00';
      const totalContribution = position.avgGoals + position.avgAssists;
      const valuePerGoal = position.avgGoals > 0 ? position.avgMarketValue / position.avgGoals : 0;
      
      return {
        position: position.position,
        playerCount: position.count,
        goalsPerGame: parseFloat(goalsPerGame),
        assistsPerGame: parseFloat(assistsPerGame),
        totalGoals: position.avgGoals,
        totalAssists: position.avgAssists,
        totalContribution,
        valuePerGoal,
        avgMarketValue: position.avgMarketValue,
        efficiency: totalContribution > 0 ? (totalContribution / position.avgMarketValue * 1000000).toFixed(3) : '0.000' // Contribución por millón de euros
      };
    }).filter(Boolean);
  };

  const performanceMetrics = calculatePerformanceMetrics();

  // Datos para gráfico de eficiencia (goles + asistencias por posición)
    const efficiencyData = performanceMetrics.map(item => ({
    position: item.position,
    goles: Number(item.totalGoals.toFixed(2)),
    asistencias: Number(item.totalAssists.toFixed(2)),
    contribucion: Number(item.totalContribution.toFixed(2))
    }));

    // Datos para gráfico de valor vs rendimiento
    const valueVsPerformanceData = performanceMetrics.map(item => ({
    position: item.position,
    valor: Number((item.avgMarketValue / 1000000).toFixed(2)), // En millones
    contribucion: Number(item.totalContribution.toFixed(2)),
    eficiencia: Number(parseFloat(item.efficiency).toFixed(2))
    }));

  // Tooltip personalizado para eficiencia
  const EfficiencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              <span className="font-medium">{entry.dataKey}:</span> {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para valor vs rendimiento
  const ValueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600">
            Valor promedio: <span className="font-medium">{data.valor.toFixed(1)}M €</span>
          </p>
          <p className="text-sm text-gray-600">
            Contribución: <span className="font-medium">{data.contribucion}</span> goles+asistencias
          </p>
          <p className="text-sm text-gray-600">
            Eficiencia: <span className="font-medium">{data.eficiencia}</span> por M€
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0 || performanceMetrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-gray-500">
          <Target className="h-8 w-8 mr-2" />
          <span>No hay datos de rendimiento disponibles</span>
        </div>
      </div>
    );
  }

  // Calcular totales para las métricas resumen
  const totalPlayers = performanceMetrics.reduce((acc, item) => acc + item.playerCount, 0);
  const avgGoalsPerGame = performanceMetrics.reduce((acc, item) => acc + item.goalsPerGame * item.playerCount, 0) / totalPlayers;
  const avgAssistsPerGame = performanceMetrics.reduce((acc, item) => acc + item.assistsPerGame * item.playerCount, 0) / totalPlayers;
  const bestPosition = performanceMetrics.reduce((best, current) => 
    current.totalContribution > best.totalContribution ? current : best
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Estadísticas de Rendimiento
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {performanceMetrics.length} posiciones analizadas
          </span>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="font-bold text-xl text-blue-700">{avgGoalsPerGame.toFixed(2)}</div>
          <div className="text-sm text-blue-600">Goles/Partido Promedio</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="font-bold text-xl text-green-700">{avgAssistsPerGame.toFixed(2)}</div>
          <div className="text-sm text-green-600">Asistencias/Partido Promedio</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="font-bold text-xl text-purple-700">{bestPosition.position}</div>
          <div className="text-sm text-purple-600">Posición Más Productiva</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="font-bold text-xl text-orange-700">{bestPosition.totalContribution.toFixed(2)}</div>
          <div className="text-sm text-orange-600">Mayor Contribución</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Eficiencia Ofensiva */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <Award className="h-4 w-4 mr-2 text-yellow-500" />
            Eficiencia Ofensiva por Posición
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="position" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<EfficiencyTooltip />} />
                <Bar dataKey="goles" fill="#ef4444" name="Goles" radius={[2, 2, 0, 0]} />
                <Bar dataKey="asistencias" fill="#10b981" name="Asistencias" radius={[2, 2, 0, 0]} />
                <Line 
                  type="monotone" 
                  dataKey="contribucion" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Contribución Total"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Valor vs Rendimiento */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
            Valor de Mercado vs Rendimiento
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={valueVsPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="position" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  label={{ value: 'Valor (M€)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  label={{ value: 'Contribución', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<ValueTooltip />} />
                <Bar 
                  yAxisId="left"
                  dataKey="valor" 
                  fill="#0ea5e9" 
                  name="Valor (M€)" 
                  opacity={0.7}
                  radius={[2, 2, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="contribucion" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  name="Contribución"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Rendimiento Detallado */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Métricas Detalladas por Posición</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Posición</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Jugadores</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Goles/Partido</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Asist./Partido</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Contribución Total</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Eficiencia*</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((metric) => (
                <tr key={metric.position} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{metric.position}</td>
                  <td className="py-2 px-3 text-gray-600">{metric.playerCount}</td>
                  <td className="py-2 px-3 text-gray-600">{metric.goalsPerGame}</td>
                  <td className="py-2 px-3 text-gray-600">{metric.assistsPerGame}</td>
                  <td className="py-2 px-3 text-gray-600">{metric.totalContribution.toFixed(2)}</td>
                  <td className="py-2 px-3 text-gray-600">{metric.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-2">
            * Eficiencia = (Goles + Asistencias) por millón de euros de valor de mercado
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;