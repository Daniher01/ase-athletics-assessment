// src/pages/Dashboard/index.tsx - Modificaciones necesarias

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/dashboard/StatCard';
import PositionChart from '../../components/dashboard/PositionChart';
import TopScorers from '../../components/dashboard/TopScorers';
import AttributesRadar from '../../components/dashboard/AttributesRadar'; // ✅ NUEVO IMPORT
import { 
  dashboardService, 
  DashboardData,
  TopPlayer,
  AttributesByPosition // ✅ NUEVO IMPORT
} from '../../services/dashboardService';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [attributesData, setAttributesData] = useState<AttributesByPosition[]>([]); // ✅ NUEVO ESTADO

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ OBTENER datos del dashboard Y atributos por separado
      const [dashboard, attributes] = await Promise.all([
        dashboardService.getDashboardData(),
        dashboardService.getAttributesByPosition()
      ]);
      
      setDashboardData(dashboard);
      setAttributesData(attributes);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ FUNCIONES DE FORMATEO (que ya tenías en tu código original)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatCompactNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num);
  };

  // ✅ ESTADOS DE LOADING Y ERROR (que ya tenías)
  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-600">Análisis general de jugadores</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 animate-pulse">
                <div className="h-4 bg-secondary-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-secondary-200 rounded w-16"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="h-6 bg-secondary-200 rounded w-32 mb-4"></div>
              <div className="h-64 bg-secondary-100 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <div className="h-6 bg-secondary-200 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-secondary-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-600">Análisis general de jugadores</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-medium text-red-800">Error al cargar datos</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Estados de loading y error existentes

  if (!dashboardData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center text-secondary-600">
            No hay datos disponibles
          </div>
        </div>
      </Layout>
    );
  }

  const { 
    basicStats, 
    positionDistribution, 
    topPlayers, 
    marketAnalysis,
    teamDistribution 
  } = dashboardData;

  return (
    <Layout>
      <div className="p-6">
        {/* Header existente */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Análisis general de jugadores</p>
        </div>

        {/* Stats Cards existentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jugadores"
            value={formatNumber(basicStats.totalPlayers)}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Edad Promedio"
            value={`${basicStats.avgAge.toFixed(1)} años`}
            icon={Calendar}
            color="secondary"
          />
          <StatCard
            title="Reportes Scouting"
            value={formatNumber(basicStats.totalReports)}
            icon={FileText}
            color="success"
          />
          <StatCard
            title="Valor de Mercado"
            value={formatCompactNumber(basicStats.avgMarketValue)}
            icon={DollarSign}
            color="warning"
          />
        </div>

        {/* Charts principales existentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PositionChart data={positionDistribution} />
          <TopScorers data={topPlayers.topScorers.slice(0, 10)} />
        </div>

        {/* ✅ NUEVA SECCIÓN: Radar + Top Teams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* NUEVO: Gráfico de Radar */}
          <AttributesRadar data={attributesData} />
          
          {/* MANTENER: Top Teams (movido aquí) */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Equipos Principales
            </h3>
            <div className="space-y-3">
              {teamDistribution.slice(0, 5).map((team, index) => (
                <div key={team.team} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-secondary-900">{team.team}</div>
                    <div className="text-xs text-secondary-500">
                      {team.count} jugadores
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-secondary-700">
                      {formatCompactNumber(team.avgMarketValue)}
                    </div>
                    <div className="text-xs text-secondary-500">
                      {team.avgAge.toFixed(1)} años
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ❌ ELIMINAR: Las 3 cards (Market Analysis, Top Teams, Quick Stats) */}
        
        {/* ✅ MANTENER: Contratos próximos a vencer */}
        {marketAnalysis.expiringContracts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Contratos Próximos a Vencer
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-3 px-4 font-medium text-secondary-700">Jugador</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-700">Equipo</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-700">Vencimiento</th>
                    <th className="text-left py-3 px-4 font-medium text-secondary-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {marketAnalysis.expiringContracts.slice(0, 10).map((contract) => {
                    const contractDate = new Date(contract.contractEnd);
                    const now = new Date();
                    const daysRemaining = Math.ceil((contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={contract.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                        <td className="py-3 px-4 font-medium text-secondary-900">{contract.name}</td>
                        <td className="py-3 px-4 text-secondary-600">{contract.team}</td>
                        <td className="py-3 px-4 text-secondary-600">
                          {contractDate.toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            daysRemaining <= 30 
                              ? 'bg-red-100 text-red-800' 
                              : daysRemaining <= 90 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : daysRemaining <= 180
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining} días` : 'Vencido'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;