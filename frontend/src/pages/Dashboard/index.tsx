// src/pages/Dashboard/index.tsx - COMPLETO CON FILTROS DE CONTRATOS

import React, { useState, useEffect } from 'react';
import { 
 Users, 
 Calendar, 
 Target, 
 TrendingUp, 
 DollarSign,
 AlertCircle,
 FileText,
 UserCheck,
 ArrowUpDown,
 ArrowUp,
 ArrowDown
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/dashboard/StatCard';
import PositionChart from '../../components/dashboard/PositionChart';
import TopScorers from '../../components/dashboard/TopScorers';
import AttributesRadar from '../../components/dashboard/AttributesRadar';
import MarketTrendChart from '../../components/dashboard/MarketTrendChart';
import PerformanceStats from '../../components/dashboard/PerformanceStats';
import { 
 dashboardService, 
 DashboardData,
 TopPlayer,
 AttributesByPosition
} from '../../services/dashboardService';

const Dashboard: React.FC = () => {
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
 const [attributesData, setAttributesData] = useState<AttributesByPosition[]>([]);
 const [ageSortOrder, setAgeSortOrder] = useState<'asc' | 'desc' | null>(null);
 const [contractUrgencyFilter, setContractUrgencyFilter] = useState<string>('all');
 const [contractTeamFilter, setContractTeamFilter] = useState<string>('');

 const fetchDashboardData = async () => {
   try {
     setLoading(true);
     setError(null);
     
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

 const handleAgeSorting = () => {
   if (ageSortOrder === null || ageSortOrder === 'desc') {
     setAgeSortOrder('asc');
   } else {
     setAgeSortOrder('desc');
   }
 };

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

 const getSortedTeams = () => {
   if (!teamDistribution) return [];
   if (!ageSortOrder) return teamDistribution;
   
   return [...teamDistribution].sort((a, b) => {
     if (ageSortOrder === 'asc') {
       return a.avgAge - b.avgAge;
     } else {
       return b.avgAge - a.avgAge;
     }
   });
 };

 const getFilteredContracts = () => {
   if (!marketAnalysis.expiringContracts) return [];
   
   let filtered = [...marketAnalysis.expiringContracts];
   
   // Filtrar por equipo
   if (contractTeamFilter) {
     filtered = filtered.filter(contract => contract.team === contractTeamFilter);
   }
   
   // Filtrar por urgencia
   if (contractUrgencyFilter !== 'all') {
     filtered = filtered.filter(contract => {
       const contractDate = new Date(contract.contractEnd);
       const now = new Date();
       const daysRemaining = Math.ceil((contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
       
       switch (contractUrgencyFilter) {
         case 'critical':
           return daysRemaining <= 30;
         case 'upcoming':
           return daysRemaining > 30 && daysRemaining <= 90;
         case 'longterm':
           return daysRemaining > 90;
         case 'expired':
           return daysRemaining <= 0;
         default:
           return true;
       }
     });
   }
   
   return filtered;
 };

 const getContractTeams = () => {
   if (!marketAnalysis.expiringContracts) return [];
   const teams = [...new Set(marketAnalysis.expiringContracts.map(contract => contract.team))];
   return teams.sort();
 };

 const sortedTeams = getSortedTeams();
 const filteredContracts = getFilteredContracts();
 const contractTeams = getContractTeams();

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

       {/* ✅ NUEVO LAYOUT: Distribución de tamaños mejorada */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         {/* Distribución por posición - más pequeño */}
         <div className="lg:col-span-2">
           <PositionChart data={positionDistribution} />
         </div>
         
         {/* Radar de atributos - más grande */}
         <div className="lg:col-span-2">
           <AttributesRadar data={attributesData} />
         </div>
       </div>

       {/* ✅ AGREGAR: Gráfico de Tendencias de Mercado */}
       <div className="mb-8">
         <MarketTrendChart data={positionDistribution} />
       </div>

       <div className="mb-8">
         <PerformanceStats data={positionDistribution} />
       </div>

       {/* Segunda fila: TopScorers + TopTeams */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
         <TopScorers data={topPlayers.topScorers.slice(0, 10)} />

         {/* MANTENER: Top Teams con ordenamiento por edad */}
         <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-secondary-900">
               Equipos Principales
             </h3>
             <button
               onClick={handleAgeSorting}
               className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
               title="Ordenar por edad promedio"
             >
               <Calendar className="h-4 w-4" />
               <span>Edad</span>
               {ageSortOrder === null && <ArrowUpDown className="h-3 w-3" />}
               {ageSortOrder === 'asc' && <ArrowUp className="h-3 w-3" />}
               {ageSortOrder === 'desc' && <ArrowDown className="h-3 w-3" />}
             </button>
           </div>
           <div className="space-y-3">
             {sortedTeams.slice(0, 10).map((team, index) => (
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

{/* ✅ MANTENER: Contratos próximos a vencer con filtros RESPONSIVOS */}
{marketAnalysis.expiringContracts.length > 0 && (
  <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
    {/* Header responsivo */}
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900">
          Contratos Próximos a Vencer
        </h3>
        <span className="text-sm font-normal text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {filteredContracts.length} de {marketAnalysis.expiringContracts.length}
        </span>
      </div>
      
      {/* Filtros responsivos */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Filtro por Urgencia */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Urgencia:</label>
          <select
            value={contractUrgencyFilter}
            onChange={(e) => setContractUrgencyFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="expired">Vencidos</option>
            <option value="critical">Críticos (&lt;30 días)</option>
            <option value="upcoming">Próximos (30-90 días)</option>
            <option value="longterm">A largo plazo (&gt;90 días)</option>
          </select>
        </div>
        
        {/* Filtro por Equipo */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Equipo:</label>
          <select
            value={contractTeamFilter}
            onChange={(e) => setContractTeamFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los equipos</option>
            {contractTeams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        {/* Botón limpiar filtros - solo visible en móvil si hay filtros activos */}
        {(contractUrgencyFilter !== 'all' || contractTeamFilter !== '') && (
          <button
            onClick={() => {
              setContractUrgencyFilter('all');
              setContractTeamFilter('');
            }}
            className="sm:hidden w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>

    {filteredContracts.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No hay contratos que coincidan con los filtros seleccionados</p>
        <button
          onClick={() => {
            setContractUrgencyFilter('all');
            setContractTeamFilter('');
          }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Limpiar filtros
        </button>
      </div>
    ) : (
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-4 font-medium text-secondary-700 text-sm">Jugador</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700 text-sm hidden sm:table-cell">Equipo</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700 text-sm">Vencimiento</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-700 text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.slice(0, 10).map((contract) => {
                const contractDate = new Date(contract.contractEnd);
                const now = new Date();
                const daysRemaining = Math.ceil((contractDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={contract.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-secondary-900 text-sm">{contract.name}</div>
                      {/* Mostrar equipo en móvil debajo del nombre */}
                      <div className="text-xs text-secondary-500 sm:hidden">{contract.team}</div>
                    </td>
                    <td className="py-3 px-4 text-secondary-600 text-sm hidden sm:table-cell">{contract.team}</td>
                    <td className="py-3 px-4 text-secondary-600 text-xs sm:text-sm">
                      {contractDate.toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit',
                        year: window.innerWidth > 640 ? 'numeric' : '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        daysRemaining <= 0
                          ? 'bg-gray-100 text-gray-800' 
                          : daysRemaining <= 30 
                            ? 'bg-red-100 text-red-800' 
                            : daysRemaining <= 90 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : daysRemaining <= 180
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                      }`}>
                        {daysRemaining <= 0 ? 'Vencido' : (
                          window.innerWidth > 640 
                            ? `${daysRemaining} días`
                            : `${daysRemaining}d`
                        )}
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
)}
     </div>
   </Layout>
 );
};

export default Dashboard;