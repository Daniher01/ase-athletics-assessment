// src/pages/Reports/index.tsx
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, User, Target, Star, Eye, Edit, Trash2 } from 'lucide-react';
import Layout from '../../components/common/Layout';
import ReportForm from '../../components/reports/ReportForm';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { Report, reportsService } from '../../services/reportsService';
import { useToast } from '../../context/ToastContext';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useToast();

  // Manejar éxito de creación
  const handleCreateSuccess = () => {
    loadReports(); // Recargar la lista
    setShowCreateModal(false);
  };

  // Manejar eliminación
  const handleDelete = (report: Report) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport) return;
    
    try {
      setDeleteLoading(true);
      await reportsService.deleteReport(selectedReport.id);
      toast.success(
        'Reporte eliminado', 
        `El reporte de ${selectedReport.player.name} ha sido eliminado correctamente`
      );
      loadReports(); // Recargar la lista
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error('Error al eliminar', 'No se pudo eliminar el reporte');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setSelectedReport(null);
    }
  };

  // Navegar al detalle
  const handleViewReport = (reportId: number) => {
    window.location.href = `/reports/${reportId}`;
  };

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
  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    
    return (
      report.player.name.toLowerCase().includes(searchLower) ||
      report.player.team.toLowerCase().includes(searchLower) ||
      report.competition.toLowerCase().includes(searchLower) ||
      report.opponent.toLowerCase().includes(searchLower) ||
      report.scout.name.toLowerCase().includes(searchLower) ||
      report.overallRating.toString().includes(searchTerm)
    );
  });

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
            onClick={() => setShowCreateModal(true)}
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
              placeholder="Buscar por jugador, equipo, competición, oponente, scout o rating..."
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
            <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header Responsivo */}
                  <div className="flex flex-col space-y-3 mb-4">
                    {/* Nombre y posición */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {report.player.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {report.player.position}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            • {report.player.team}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button 
                          onClick={() => handleViewReport(report.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                          title="Editar reporte"
                          onClick={() => toast.info('Función de edición', 'La edición de reportes estará disponible pronto')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(report)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Eliminar reporte"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Match Info - Responsivo */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 text-xs sm:text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {formatDate(report.matchDate)}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{report.competition}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>vs {report.opponent}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {report.scout.name}
                    </span>
                  </div>

                  {/* Rating - Responsivo */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center space-x-1">
                        {renderRatingStars(report.overallRating)}
                      </div>
                      <span className="text-sm font-bold text-gray-900 ml-2">
                        {formatRating(report.overallRating)}/10
                      </span>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses Preview - Responsivo */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">Fortalezas</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.strengths.slice(0, 2).map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{strength}</span>
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
                      <h4 className="text-sm font-medium text-red-700 mb-2">Debilidades</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.weaknesses.slice(0, 2).map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                            <span className="leading-relaxed">{weakness}</span>
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

                  {/* Recomendación - Responsivo */}
                  <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Target className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0" />
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
              onClick={() => setShowCreateModal(true)}
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

        {/* Modal de creación */}
        <ReportForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Modal de eliminación */}
        {selectedReport && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedReport(null);
            }}
            onConfirm={handleConfirmDelete}
            loading={deleteLoading}
            title="Eliminar Reporte"
            message="¿Estás seguro de que quieres eliminar este reporte de scouting?"
            itemName={`Reporte de ${selectedReport.player.name}`}
            type="danger"
          />
        )}
      </div>
    </Layout>
  );
};

export default Reports;