// src/components/reports/ReportForm.tsx
import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Star, Target, Plus, Trash2 } from 'lucide-react';
import { Player, playerService } from '../../services/playerService';
import { CreateReportData, reportsService } from '../../services/reportsService';
import { useToast } from '../../context/ToastContext';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type FormTab = 'basic' | 'rating' | 'evaluation';

const ReportForm: React.FC<ReportFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const toast = useToast();

  // Form data
  const [formData, setFormData] = useState<CreateReportData>({
    playerId: 0,
    scoutId: 1, // Por ahora hardcoded, luego puedes obtenerlo del usuario logueado
    matchDate: '',
    competition: '',
    opponent: '',
    overallRating: 5,
    strengths: [''],
    weaknesses: [''],
    recommendation: '',
    notes: ''
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar jugadores disponibles
  useEffect(() => {
    if (isOpen) {
      loadPlayers();
      // Reset form when modal opens
      setFormData({
        playerId: 0,
        scoutId: 1,
        matchDate: '',
        competition: '',
        opponent: '',
        overallRating: 5,
        strengths: [''],
        weaknesses: [''],
        recommendation: '',
        notes: ''
      });
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen]);

  const loadPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const response = await playerService.getPlayers(1, 100, {});
      if (response.success) {
        setPlayers(response.data);
      }
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.playerId) newErrors.playerId = 'Selecciona un jugador';
    if (!formData.matchDate) newErrors.matchDate = 'Fecha del partido es requerida';
    if (!formData.competition.trim()) newErrors.competition = 'Competición es requerida';
    if (!formData.opponent.trim()) newErrors.opponent = 'Oponente es requerido';
    if (formData.overallRating < 1 || formData.overallRating > 10) {
      newErrors.overallRating = 'Rating debe estar entre 1 y 10';
    }
    if (formData.strengths.filter(s => s.trim()).length === 0) {
      newErrors.strengths = 'Agrega al menos una fortaleza';
    }
    if (formData.weaknesses.filter(w => w.trim()).length === 0) {
      newErrors.weaknesses = 'Agrega al menos una debilidad';
    }
    if (!formData.recommendation.trim()) newErrors.recommendation = 'Recomendación es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Limpiar arrays de strengths y weaknesses
      const cleanedData = {
        ...formData,
        strengths: formData.strengths.filter(s => s.trim() !== ''),
        weaknesses: formData.weaknesses.filter(w => w.trim() !== '')
      };

      await reportsService.createReport(cleanedData);
      
      // Obtener nombre del jugador para la notificación
      const selectedPlayer = players.find(p => p.id === formData.playerId);
      const playerName = selectedPlayer ? selectedPlayer.name : 'el jugador';
      
      // Notificación de éxito
      toast.success(
        'Reporte creado exitosamente', 
        `Se ha creado el reporte de scouting para ${playerName}`
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating report:', error);
      
      // Notificación de error
      toast.error(
        'Error al crear reporte', 
        'No se pudo crear el reporte. Inténtalo de nuevo.'
      );
      
      setErrors({ submit: 'Error al crear el reporte. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  // Agregar/remover items de arrays
  const addArrayItem = (field: 'strengths' | 'weaknesses') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (field: 'strengths' | 'weaknesses', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: newArray.length > 0 ? newArray : [''] // Mantener al menos un campo
    });
  };

  const updateArrayItem = (field: 'strengths' | 'weaknesses', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  // Renderizar estrellas para rating
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      const isFilled = i <= formData.overallRating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setFormData({ ...formData, overallRating: i })}
          className={`text-2xl transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          <Star className={`h-6 w-6 ${isFilled ? 'fill-current' : ''}`} />
        </button>
      );
    }
    return stars;
  };

  const tabs = [
    { key: 'basic' as FormTab, label: 'Información Básica', icon: User },
    { key: 'rating' as FormTab, label: 'Calificación', icon: Star },
    { key: 'evaluation' as FormTab, label: 'Evaluación', icon: Target }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Reporte</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Tab 1: Información Básica */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selección de jugador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jugador *
                  </label>
                  <select
                    value={formData.playerId}
                    onChange={(e) => setFormData({ ...formData, playerId: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.playerId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loadingPlayers}
                  >
                    <option value={0}>
                      {loadingPlayers ? 'Cargando jugadores...' : 'Selecciona un jugador'}
                    </option>
                    {players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} - {player.position} ({player.team})
                      </option>
                    ))}
                  </select>
                  {errors.playerId && (
                    <p className="text-red-500 text-xs mt-1">{errors.playerId}</p>
                  )}
                </div>

                {/* Fecha del partido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Partido *
                  </label>
                  <input
                    type="date"
                    value={formData.matchDate}
                    onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.matchDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.matchDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.matchDate}</p>
                  )}
                </div>

                {/* Competición */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competición *
                  </label>
                  <input
                    type="text"
                    value={formData.competition}
                    onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                    placeholder="Ej: Champions League, La Liga"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.competition ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.competition && (
                    <p className="text-red-500 text-xs mt-1">{errors.competition}</p>
                  )}
                </div>

                {/* Oponente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oponente *
                  </label>
                  <input
                    type="text"
                    value={formData.opponent}
                    onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                    placeholder="Ej: Barcelona, Real Madrid"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.opponent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.opponent && (
                    <p className="text-red-500 text-xs mt-1">{errors.opponent}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Calificación */}
          {activeTab === 'rating' && (
            <div className="space-y-6">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Calificación General *
                </label>
                
                {/* Estrellas */}
                <div className="flex justify-center space-x-1 mb-4">
                  {renderRatingStars()}
                </div>
                
                {/* Slider */}
                <div className="max-w-md mx-auto">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formData.overallRating}
                    onChange={(e) => setFormData({ ...formData, overallRating: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
                
                {/* Valor actual */}
                <div className="mt-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {formData.overallRating.toFixed(1)}/10
                  </span>
                </div>
                
                {errors.overallRating && (
                  <p className="text-red-500 text-xs mt-2">{errors.overallRating}</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Evaluación */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              {/* Fortalezas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fortalezas *
                </label>
                {formData.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) => updateArrayItem('strengths', index, e.target.value)}
                      placeholder="Describe una fortaleza del jugador"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.strengths.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('strengths', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('strengths')}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar fortaleza
                </button>
                {errors.strengths && (
                  <p className="text-red-500 text-xs mt-1">{errors.strengths}</p>
                )}
              </div>

              {/* Debilidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Debilidades *
                </label>
                {formData.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={weakness}
                      onChange={(e) => updateArrayItem('weaknesses', index, e.target.value)}
                      placeholder="Describe una debilidad del jugador"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.weaknesses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('weaknesses', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('weaknesses')}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar debilidad
                </button>
                {errors.weaknesses && (
                  <p className="text-red-500 text-xs mt-1">{errors.weaknesses}</p>
                )}
              </div>

              {/* Recomendación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recomendación *
                </label>
                <textarea
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  placeholder="¿Qué recomiendas hacer con este jugador?"
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.recommendation ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.recommendation && (
                  <p className="text-red-500 text-xs mt-1">{errors.recommendation}</p>
                )}
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observaciones adicionales sobre el jugador"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {activeTab !== 'basic' && (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.key === activeTab) - 1].key)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
            )}
            {activeTab !== 'evaluation' && (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.key === activeTab) + 1].key)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            
            {activeTab === 'evaluation' && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Reporte'}
              </button>
            )}
          </div>
        </div>

        {/* Error de envío */}
        {errors.submit && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportForm;