// src/pages/Reports/index.tsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, User, Target, Star, Eye, Edit, Trash2 } from 'lucide-react';
import Layout from '../../components/common/Layout';
import { Report, reportsService } from '../../services/reportsService';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Cargar reportes
  useEffect(() => {
    loadReports();
  }, [currentPage]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportsService.getReports(currentPage, 10, {});
      
      if (response.success) {
        setReports(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.totalCount);
      } else {
        setError(response.message || 'Error al cargar reportes');
      }
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reportes por búsqueda local
  const filteredReports = reports.filter(report =>
    report.player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.competition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.scout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear calificación
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  // Renderizar estrellas
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    
    const remainingStars = 10 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Reportes de Scouting
            </h1>
            <p className="text-gray-600 mt-1">
              Análisis y evaluaciones de jugadores por scouts profesionales
            </p>
          </div>
          
          <button
            onClick={() => {/* TODO: Abrir modal de creación */}}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reportes</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Promedio Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.length > 0 
                    ? (reports.reduce((sum, report) => sum + report.overallRating, 0) / reports.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scouts Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(reports.map(r => r.scout.id))].length}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por jugador, competición, oponente o scout..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                {filteredReports.length} resultados encontrados para "{searchTerm}"
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.player.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {report.player.position} • {report.player.team}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="flex items-center space-x-6 mb-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(report.matchDate)}
                    </span>
                    <span>{report.competition}</span>
                    <span>vs {report.opponent}</span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {report.scout.name}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <div className="flex items-center space-x-1">
                      {renderRatingStars(report.overallRating)}
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatRating(report.overallRating)}/10
                    </span>
                  </div>

                  {/* Strengths & Weaknesses Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-1">Fortalezas</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.strengths.slice(0, 2).map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                        {report.strengths.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{report.strengths.length - 2} más...
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-1">Debilidades</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.weaknesses.slice(0, 2).map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {weakness}
                          </li>
                        ))}
                        {report.weaknesses.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{report.weaknesses.length - 2} más...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Recomendación */}
                  <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Target className="h-4 w-4 mr-1 text-blue-500" />
                      Recomendación
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {report.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay reportes disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'No se encontraron reportes que coincidan con la búsqueda'
                : 'Aún no hay reportes de scouting creados'
              }
            </p>
            <button
              onClick={() => {/* TODO: Abrir modal de creación */}}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Reporte
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalCount)} de {totalCount} reportes
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;