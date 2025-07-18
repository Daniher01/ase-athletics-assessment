// src/components/comparison/ComparisonExport.tsx
import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Player } from '../../services/playerService';
import { exportToCSV, exportToExcel } from '../../utils/exportUtils';

interface ComparisonExportProps {
  players: Player[];
  activeCategory: 'performance' | 'attributes' | 'market';
}

const ComparisonExport: React.FC<ComparisonExportProps> = ({ players, activeCategory }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Preparar datos específicos para comparación
  const prepareComparisonData = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const categoryLabel = {
      performance: 'rendimiento',
      attributes: 'atributos', 
      market: 'mercado'
    }[activeCategory];

    return {
      players,
      filename: `comparacion_${categoryLabel}_${players.length}jugadores`,
      metadata: {
        fecha_exportacion: timestamp,
        categoria_comparada: categoryLabel,
        jugadores_comparados: players.length,
        nombres_jugadores: players.map(p => p.name).join(', ')
      }
    };
  };

  // Exportar a PDF capturando TODAS las categorías
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // Guardar categoría original
      const originalCategory = activeCategory;
      
      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Header principal del PDF
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Comparación Completa de Jugadores', pdfWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Jugadores: ${players.map(p => p.name).join(', ')}`, pdfWidth / 2, 28, { align: 'center' });
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pdfWidth / 2, 35, { align: 'center' });

      // Array de categorías a capturar
      const categories: Array<{key: 'performance' | 'attributes' | 'market', label: string}> = [
        { key: 'performance', label: 'Rendimiento' },
        { key: 'attributes', label: 'Atributos' },
        { key: 'market', label: 'Mercado' }
      ];

      let currentPage = 1;
      let yPosition = 50;

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        
        // Trigger a category change and wait for re-render
        window.dispatchEvent(new CustomEvent('changeCategoryForPDF', { 
          detail: { category: category.key } 
        }));
        
        // Esperar para actualizar el DOM
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Buscar el contenedor de comparación
        const comparisonElement = document.querySelector('[data-comparison-container]');
        if (!comparisonElement) {
          console.warn(`No se encontró contenido para ${category.label}`);
          continue;
        }

        // Capturar la sección actual
        const canvas = await html2canvas(comparisonElement as HTMLElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: comparisonElement.scrollWidth,
          height: comparisonElement.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calcular dimensiones
        const maxWidth = pdfWidth - 20; 
        const maxHeight = pdfHeight - 80; 
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;

        // Si no es la primera categoría, agregar nueva página
        if (i > 0) {
          pdf.addPage();
          currentPage++;
          yPosition = 20;
        }

        // Título de la sección
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${category.label}`, 20, yPosition);
        yPosition += 10;

        // Agregar la imagen
        const x = (pdfWidth - finalWidth) / 2;
        pdf.addImage(imgData, 'PNG', x, yPosition, finalWidth, finalHeight);
        yPosition += finalHeight + 10;
      }

      // Restaurar categoría original
      window.dispatchEvent(new CustomEvent('changeCategoryForPDF', { 
        detail: { category: originalCategory } 
      }));

      // Generar nombre de archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `comparacion_completa_${timestamp}.pdf`;
      
      // Descargar
      pdf.save(filename);
      
      showSuccessNotification('PDF completo generado correctamente');
    } catch (error) {
      console.error('Error generating complete PDF:', error);
      showErrorNotification('Error al generar PDF completo: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
      setIsDropdownOpen(false);
    }
  };

  // Exportar a CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const comparisonData = prepareComparisonData();
      
      await exportToCSV(comparisonData);
      
      // Mostrar notificación de éxito
      showSuccessNotification('CSV exportado correctamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showErrorNotification('Error al exportar CSV');
    } finally {
      setIsExporting(false);
      setIsDropdownOpen(false);
    }
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const comparisonData = prepareComparisonData();
      
      await exportToExcel(comparisonData);
      
      // Mostrar notificación de éxito
      showSuccessNotification('Excel exportado correctamente');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showErrorNotification('Error al exportar Excel');
    } finally {
      setIsExporting(false);
      setIsDropdownOpen(false);
    }
  };

  // Notificaciones simples
  const showSuccessNotification = (message: string) => {
    // Implementar notificación de éxito
    console.log('✅ Success:', message);
  };

  const showErrorNotification = (message: string) => {
    // Implementar notificación de error
    console.error('❌ Error:', message);
  };

  const exportOptions = [
    {
      key: 'pdf',
      label: 'PDF Completo',
      icon: FileText,
      handler: handleExportPDF,
      description: 'Todas las categorías: Rendimiento + Atributos + Mercado'
    },
    {
      key: 'excel',
      label: 'Excel Completo',
      icon: FileSpreadsheet,
      handler: handleExportExcel,
      description: 'Todos los datos de jugadores en Excel'
    },
    {
      key: 'csv',
      label: 'CSV Completo',
      icon: FileText,
      handler: handleExportCSV,
      description: 'Todos los datos de jugadores en CSV'
    }
  ];

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
          isExporting
            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exportando...' : 'Exportar'}
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Exportar Comparación</h3>
            <p className="text-sm text-gray-600 mt-1">
              {players.length} jugadores seleccionados
            </p>
          </div>

          <div className="p-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={option.handler}
                  disabled={isExporting}
                  className="w-full flex items-start p-3 hover:bg-gray-50 rounded-md transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-xs text-gray-500">
              <FileText className="h-3 w-3 mr-1" />
              <span>Los archivos incluyen fecha en el nombre</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default ComparisonExport;