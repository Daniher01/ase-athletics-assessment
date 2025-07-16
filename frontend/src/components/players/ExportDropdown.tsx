// src/components/players/ExportDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Player } from '../../services/playerService';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

interface ExportDropdownProps {
  players: Player[];
  filters: any;
  disabled?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  players,
  filters,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'csv' | 'excel') => {
    if (players.length === 0) {
      toast.warning('Sin datos', 'No hay jugadores para exportar');
      return;
    }

    try {
      setLoading(format);
      
      const filename = generateFilename(filters);
      let exportedFile = '';

      if (format === 'csv') {
        exportedFile = exportToCSV({ players, filename });
        toast.success('CSV Exportado', `Se han exportado ${players.length} jugadores a ${exportedFile}`);
      } else if (format === 'excel') {
        exportedFile = exportToExcel({ players, filename });
        toast.success('Excel Exportado', `Se han exportado ${players.length} jugadores a ${exportedFile}`);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error de exportación', 'No se pudo exportar el archivo');
    } finally {
      setLoading(null);
    }
  };

  const generateFilename = (filters: any): string => {
    let filename = 'jugadores';
    
    if (filters.position) {
      filename += `_${filters.position.toLowerCase()}`;
    }
    if (filters.team) {
      filename += `_${filters.team.toLowerCase().replace(/\s+/g, '_')}`;
    }
    if (filters.nationality) {
      filename += `_${filters.nationality.toLowerCase()}`;
    }
    if (filters.search) {
      filename += '_busqueda';
    }
    
    return filename;
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (filters.search) activeFilters.push(`Búsqueda: "${filters.search}"`);
    if (filters.position) activeFilters.push(`Posición: ${filters.position}`);
    if (filters.team) activeFilters.push(`Equipo: ${filters.team}`);
    if (filters.nationality) activeFilters.push(`Nacionalidad: ${filters.nationality}`);
    if (filters.minAge || filters.maxAge) {
      activeFilters.push(`Edad: ${filters.minAge || 'min'}-${filters.maxAge || 'max'}`);
    }
    
    return activeFilters.length > 0 ? activeFilters.join(', ') : 'Sin filtros aplicados';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading !== null}
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors ${
          disabled || loading !== null ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Download size={16} />
        <span>Exportar</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-secondary-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-secondary-200">
            <h3 className="font-medium text-secondary-900 mb-2">Exportar Jugadores</h3>
            <p className="text-sm text-secondary-600">
              {players.length} jugador{players.length !== 1 ? 'es' : ''} encontrado{players.length !== 1 ? 's' : ''}
            </p>
            {Object.keys(filters).some(key => filters[key] && filters[key] !== '') && (
              <div className="mt-2 p-2 bg-secondary-50 rounded text-xs text-secondary-600">
                <strong>Filtros:</strong> {getFilterSummary()}
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="p-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileText size={18} className="text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-secondary-900">Exportar como CSV</div>
                <div className="text-sm text-secondary-600">Archivo de texto separado por comas</div>
              </div>
              {loading === 'csv' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              )}
            </button>

            <button
              onClick={() => handleExport('excel')}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-secondary-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet size={18} className="text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-secondary-900">Exportar como Excel</div>
                <div className="text-sm text-secondary-600">Hoja de cálculo con formato</div>
              </div>
              {loading === 'excel' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 bg-secondary-50 border-t border-secondary-200 text-xs text-secondary-500">
            Los archivos incluyen todos los datos de jugadores y atributos
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;