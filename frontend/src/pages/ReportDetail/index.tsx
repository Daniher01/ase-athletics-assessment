// src/pages/ReportDetail/index.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Target,
  Star,
  Edit,
  Trash2,
  FileText,
  Trophy,
  AlertCircle,
  Eye,
  Mail
} from 'lucide-react';
import Layout from '../../components/common/Layout';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { Report, reportsService } from '../../services/reportsService';
import { useToast } from '../../context/ToastContext';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadReport(parseInt(id));
    }
  }, [id]);

  const loadReport = async (reportId: number) => {
    try {
      setLoading(true);
      setError(null);
      const reportData = await reportsService.getReportById(reportId);
      setReport(reportData);
    } catch (err) {
      setError('Error al cargar la información del reporte');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // TODO: Implementar edición de reporte
    toast.info('Función de edición', 'La edición de reportes estará disponible pronto');
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!report) return;
    
    try {
      setDeleteLoading(true);
      await reportsService.deleteReport(report.id);
      toast.success(
        'Reporte eliminado', 
        `El reporte de ${report.player.name} ha sido eliminado correctamente`
      );
      navigate('/reports');
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error('Error al eliminar', 'No se pudo eliminar el reporte');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Renderizar estrellas para rating
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-8 w-8 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-8 w-8 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    
    const remainingStars = 10 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-8 w-8 text-gray-300" />);
    }
    
    return stars;
  };

  // Obtener color por posición
  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'forward':
        return 'bg-blue-100 text-blue-800';
      case 'midfielder':
        return 'bg-green-100 text-green-800';
      case 'defender':
        return 'bg-yellow-100 text-yellow-800';
      case 'goalkeeper':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="p-6">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Volver a reportes
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="font-medium text-red-800">
                Error al cargar reporte
              </h3>
              <p className="text-red-600 text-sm mt-1">
                {error || 'Reporte no encontrado'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Volver a reportes
        </button>

        {/* Report Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {report.player.name}
                </h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPositionColor(report.player.position)}`}>
                  {report.player.position}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-gray-500" />
                  <span className="text-gray-600">Equipo:</span>
                  <span className="font-medium text-gray-900">{report.player.team}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-600">Fecha del partido:</span>
                  <span className="font-medium text-gray-900">{formatDateShort(report.matchDate)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-gray-500" />
                  <span className="text-gray-600">Competición:</span>
                  <span className="font-medium text-gray-900">{report.competition}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Target size={16} className="text-gray-500" />
                  <span className="text-gray-600">Oponente:</span>
                  <span className="font-medium text-gray-900">{report.opponent}</span>
                </div>
              </div>

              {/* Scout Info */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Scout Evaluador
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{report.scout.name}</p>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {report.scout.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Reporte creado</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateShort(report.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 lg:flex-col">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-300"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Report Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Calificación General
              </h3>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {renderRatingStars(report.overallRating)}
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {report.overallRating.toFixed(1)}/10
                </div>
                <div className="text-sm text-gray-600">
                  Calificación otorgada por {report.scout.name}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4">
                Fortalezas Identificadas
              </h3>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Weaknesses */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-4">
                Áreas de Mejora
              </h3>
              <ul className="space-y-3">
                {report.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-3 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommendation & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recommendation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              Recomendación del Scout
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-gray-800 leading-relaxed">{report.recommendation}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500" />
              Notas Adicionales
            </h3>
            {report.notes ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{report.notes}</p>
              </div>
            ) : (
              <div className="text-gray-500 italic text-center py-8">
                No hay notas adicionales para este reporte
              </div>
            )}
          </div>
        </div>

        {/* Match Context */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contexto del Partido
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800">
              <span className="font-medium">{report.player.name}</span> fue evaluado el{' '}
              <span className="font-medium">{formatDate(report.matchDate)}</span> durante el partido de{' '}
              <span className="font-medium">{report.competition}</span> contra{' '}
              <span className="font-medium">{report.opponent}</span>.
            </p>
            {report.updatedAt !== report.createdAt && (
              <p className="text-sm text-gray-600 mt-2">
                <em>Reporte actualizado el {formatDateShort(report.updatedAt)}</em>
              </p>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {report && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            loading={deleteLoading}
            title="Eliminar Reporte"
            message="¿Estás seguro de que quieres eliminar este reporte de scouting?"
            itemName={`Reporte de ${report.player.name}`}
            type="danger"
          />
        )}
      </div>
    </Layout>
  );
};

export default ReportDetail;