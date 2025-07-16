// src/utils/exportUtils.ts
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Player } from '../services/playerService';

export interface ExportData {
  players: Player[];
  filename?: string;
  filters?: any;
}

// Preparar datos para exportación
export const preparePlayersForExport = (players: Player[]) => {
  return players.map(player => ({
    'ID': player.id,
    'Nombre': player.name,
    'Posición': player.position,
    'Edad': player.age,
    'Equipo': player.team,
    'Nacionalidad': player.nationality,
    'Altura (cm)': player.height,
    'Peso (kg)': player.weight,
    'Goles': player.goals,
    'Asistencias': player.assists,
    'Partidos': player.appearances,
    'Salario (EUR)': player.salary,
    'Valor de Mercado (EUR)': player.marketValue,
    'Fin de Contrato': player.contractEnd,
    'Ritmo': player.attributes.pace,
    'Tiro': player.attributes.shooting,
    'Pase': player.attributes.passing,
    'Regate': player.attributes.dribbling,
    'Defensa': player.attributes.defending,
    'Físico': player.attributes.physical,
    'Definición': player.attributes.finishing || '',
    'Centros': player.attributes.crossing || '',
    'Tiros Lejanos': player.attributes.longShots || '',
    'Posicionamiento': player.attributes.positioning || '',
    'Paradas': player.attributes.diving || '',
    'Manejo': player.attributes.handling || '',
    'Patadas': player.attributes.kicking || '',
    'Reflejos': player.attributes.reflexes || ''
  }));
};

// Exportar a CSV
export const exportToCSV = (data: ExportData) => {
  const { players, filename = 'jugadores' } = data;
  
  if (players.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const exportData = preparePlayersForExport(players);
  const csv = Papa.unparse(exportData, {
    delimiter: ',',
    header: true,
    encoding: 'utf-8'
  });

  // Crear y descargar archivo
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return `${filename}.csv`;
};

// Exportar a Excel
export const exportToExcel = (data: ExportData) => {
  const { players, filename = 'jugadores' } = data;
  
  if (players.length === 0) {
    throw new Error('No hay datos para exportar');
  }

  const exportData = preparePlayersForExport(players);
  
  // Crear workbook y worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Configurar ancho de columnas
  const columnWidths = [
    { wch: 8 },   // ID
    { wch: 20 },  // Nombre
    { wch: 15 },  // Posición
    { wch: 8 },   // Edad
    { wch: 18 },  // Equipo
    { wch: 15 },  // Nacionalidad
    { wch: 12 },  // Altura
    { wch: 10 },  // Peso
    { wch: 8 },   // Goles
    { wch: 12 },  // Asistencias
    { wch: 10 },  // Partidos
    { wch: 15 },  // Salario
    { wch: 18 },  // Valor de Mercado
    { wch: 15 },  // Contrato
    // Atributos
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
    { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }
  ];
  
  ws['!cols'] = columnWidths;

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Jugadores');

  // Crear y descargar archivo
  const finalFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
  
  return finalFilename;
};

// Exportar estadísticas resumidas
export const exportSummary = (players: Player[], filters: any) => {
  const summary = {
    'Total Jugadores': players.length,
    'Edad Promedio': players.reduce((sum, p) => sum + p.age, 0) / players.length || 0,
    'Total Goles': players.reduce((sum, p) => sum + p.goals, 0),
    'Total Asistencias': players.reduce((sum, p) => sum + p.assists, 0),
    'Valor Promedio Mercado': players.reduce((sum, p) => sum + p.marketValue, 0) / players.length || 0,
    'Salario Promedio': players.reduce((sum, p) => sum + p.salary, 0) / players.length || 0,
    'Filtros Aplicados': JSON.stringify(filters, null, 2)
  };

  return summary;
};

// Formatear números para exportación
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES').format(num);
};