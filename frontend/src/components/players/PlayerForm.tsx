// src/components/players/PlayerForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { Player } from '../../services/playerService';

interface PlayerFormData {
  name: string;
  position: string;
  age: number;
  team: string;
  nationality: string;
  height: number;
  weight: number;
  goals: number;
  assists: number;
  appearances: number;
  salary: number;
  contractEnd: string;
  marketValue: number;
  attributes: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    finishing?: number;
    crossing?: number;
    longShots?: number;
    positioning?: number;
    diving?: number;
    handling?: number;
    kicking?: number;
    reflexes?: number;
  };
}

interface PlayerFormProps {
  player?: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: PlayerFormData) => Promise<void>;
  loading: boolean;
  teams: string[];
  nationalities: string[];
  positions: string[];
}

const PlayerForm: React.FC<PlayerFormProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
  loading,
  teams,
  nationalities,
  positions
}) => {
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    position: '',
    age: 18,
    team: '',
    nationality: '',
    height: 175,
    weight: 70,
    goals: 0,
    assists: 0,
    appearances: 0,
    salary: 10000,
    contractEnd: '',
    marketValue: 1000000,
    attributes: {
      pace: 50,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defending: 50,
      physical: 50,
      finishing: 50,
      crossing: 50,
      longShots: 50,
      positioning: 50,
      diving: 50,
      handling: 50,
      kicking: 50,
      reflexes: 50
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'stats' | 'attributes'>('basic');

  // Efecto para cargar datos del jugador si está editando
  useEffect(() => {
    if (player && isOpen) {
      setFormData({
        name: player.name,
        position: player.position,
        age: player.age,
        team: player.team,
        nationality: player.nationality,
        height: player.height,
        weight: player.weight,
        goals: player.goals,
        assists: player.assists,
        appearances: player.appearances,
        salary: player.salary,
        contractEnd: player.contractEnd.split('T')[0], // Convertir a formato YYYY-MM-DD
        marketValue: player.marketValue,
        attributes: {
          pace: player.attributes.pace,
          shooting: player.attributes.shooting,
          passing: player.attributes.passing,
          dribbling: player.attributes.dribbling,
          defending: player.attributes.defending,
          physical: player.attributes.physical,
          finishing: player.attributes.finishing || 50,
          crossing: player.attributes.crossing || 50,
          longShots: player.attributes.longShots || 50,
          positioning: player.attributes.positioning || 50,
          diving: player.attributes.diving || 50,
          handling: player.attributes.handling || 50,
          kicking: player.attributes.kicking || 50,
          reflexes: player.attributes.reflexes || 50
        }
      });
    } else if (!player && isOpen) {
      // Resetear formulario para crear nuevo jugador
      setFormData({
        name: '',
        position: '',
        age: 18,
        team: '',
        nationality: '',
        height: 175,
        weight: 70,
        goals: 0,
        assists: 0,
        appearances: 0,
        salary: 10000,
        contractEnd: '',
        marketValue: 1000000,
        attributes: {
          pace: 50,
          shooting: 50,
          passing: 50,
          dribbling: 50,
          defending: 50,
          physical: 50,
          finishing: 50,
          crossing: 50,
          longShots: 50,
          positioning: 50,
          diving: 50,
          handling: 50,
          kicking: 50,
          reflexes: 50
        }
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [player, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAttributeChange = (attribute: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attribute]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.position) newErrors.position = 'La posición es obligatoria';
    if (!formData.team.trim()) newErrors.team = 'El equipo es obligatorio';
    if (!formData.nationality.trim()) newErrors.nationality = 'La nacionalidad es obligatoria';
    if (formData.age < 16 || formData.age > 50) newErrors.age = 'La edad debe estar entre 16 y 50 años';
    if (formData.height < 150 || formData.height > 220) newErrors.height = 'La altura debe estar entre 150 y 220 cm';
    if (formData.weight < 50 || formData.weight > 120) newErrors.weight = 'El peso debe estar entre 50 y 120 kg';
    if (!formData.contractEnd) newErrors.contractEnd = 'La fecha de contrato es obligatoria';
    if (formData.salary < 0) newErrors.salary = 'El salario no puede ser negativo';
    if (formData.marketValue < 0) newErrors.marketValue = 'El valor de mercado no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  if (!isOpen) return null;

  const isGoalkeeper = formData.position.toLowerCase().includes('goalkeeper');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            {player ? 'Editar Jugador' : 'Crear Nuevo Jugador'}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'basic' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Información Básica
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'stats' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'attributes' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Atributos
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.name ? 'border-red-500' : 'border-secondary-300'
                      }`}
                      placeholder="Nombre completo del jugador"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Posición *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.position ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    >
                      <option value="">Seleccionar posición</option>
                      {positions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                    {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Edad *
                    </label>
                    <input
                      type="number"
                      min="16"
                      max="50"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.age ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Equipo *
                    </label>
                    <select
                      value={formData.team}
                      onChange={(e) => handleInputChange('team', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.team ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    >
                      <option value="">Seleccionar equipo</option>
                      {teams.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                    {errors.team && <p className="text-red-500 text-sm mt-1">{errors.team}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nacionalidad *
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.nationality ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    >
                      <option value="">Seleccionar nacionalidad</option>
                      {nationalities.map(nationality => (
                        <option key={nationality} value={nationality}>{nationality}</option>
                      ))}
                    </select>
                    {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Altura (cm) *
                    </label>
                    <input
                      type="number"
                      min="150"
                      max="220"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.height ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Peso (kg) *
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="120"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.weight ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Salario Mensual (EUR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.salary ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Fin de Contrato *
                    </label>
                    <input
                      type="date"
                      value={formData.contractEnd}
                      onChange={(e) => handleInputChange('contractEnd', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.contractEnd ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.contractEnd && <p className="text-red-500 text-sm mt-1">{errors.contractEnd}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Valor de Mercado (EUR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      value={formData.marketValue}
                      onChange={(e) => handleInputChange('marketValue', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none ${
                        errors.marketValue ? 'border-red-500' : 'border-secondary-300'
                      }`}
                    />
                    {errors.marketValue && <p className="text-red-500 text-sm mt-1">{errors.marketValue}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Goles
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Asistencias
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.assists}
                      onChange={(e) => handleInputChange('assists', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Partidos Jugados
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.appearances}
                      onChange={(e) => handleInputChange('appearances', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Attributes Tab */}
            {activeTab === 'attributes' && (
              <div className="space-y-6">
                <p className="text-sm text-secondary-600">
                  Ajusta los atributos del jugador usando los controles deslizantes (0-100).
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Atributos principales */}
                  {!isGoalkeeper ? (
                    <>
                      {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map((attr) => (
                        <div key={attr}>
                          <label className="block text-sm font-medium text-secondary-700 mb-2 capitalize">
                            {attr === 'pace' ? 'Ritmo' : 
                             attr === 'shooting' ? 'Tiro' :
                             attr === 'passing' ? 'Pase' :
                             attr === 'dribbling' ? 'Regate' :
                             attr === 'defending' ? 'Defensa' :
                             'Físico'}
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.attributes[attr as keyof typeof formData.attributes]}
                              onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="w-12 text-sm font-medium text-secondary-900">
                              {formData.attributes[attr as keyof typeof formData.attributes]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {['diving', 'handling', 'kicking', 'reflexes', 'positioning', 'physical'].map((attr) => (
                        <div key={attr}>
                          <label className="block text-sm font-medium text-secondary-700 mb-2 capitalize">
                            {attr === 'diving' ? 'Paradas' : 
                             attr === 'handling' ? 'Manejo' :
                             attr === 'kicking' ? 'Patadas' :
                             attr === 'reflexes' ? 'Reflejos' :
                             attr === 'positioning' ? 'Posicionamiento' :
                             'Físico'}
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.attributes[attr as keyof typeof formData.attributes] || 50}
                              onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="w-12 text-sm font-medium text-secondary-900">
                              {formData.attributes[attr as keyof typeof formData.attributes] || 50}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                {/* Atributos técnicos adicionales para jugadores de campo */}
                {!isGoalkeeper && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-4">Atributos Técnicos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['finishing', 'crossing', 'longShots', 'positioning'].map((attr) => (
                        <div key={attr}>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            {attr === 'finishing' ? 'Definición' : 
                             attr === 'crossing' ? 'Centros' :
                             attr === 'longShots' ? 'Tiros Lejanos' :
                             'Posicionamiento'}
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.attributes[attr as keyof typeof formData.attributes] || 50}
                              onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="w-12 text-sm font-medium text-secondary-900">
                              {formData.attributes[attr as keyof typeof formData.attributes] || 50}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary-200 bg-secondary-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              {loading ? 'Guardando...' : (player ? 'Actualizar' : 'Crear')} Jugador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerForm;