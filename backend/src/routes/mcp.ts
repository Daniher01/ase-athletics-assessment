import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PlayersService } from '../services/playersService';

const router = express.Router();
const playersService = new PlayersService();

// Función para generar análisis IA basado en métricas
function generarAnalisisIA(jugador: any): string {
  const { jugador: info, estadisticas, atributos, contrato, fisico } = jugador;
  
  // Calcular métricas de rendimiento
  const golesPorPartido = estadisticas.apariciones > 0 ? (estadisticas.goles / estadisticas.apariciones).toFixed(2) : '0';
  const asistenciasPorPartido = estadisticas.apariciones > 0 ? (estadisticas.asistencias / estadisticas.apariciones).toFixed(2) : '0';
  
  // Análisis de posición
  let analisisPosicion = '';
  switch (info.posicion?.toLowerCase()) {
    case 'delantero':
    case 'forward':
      analisisPosicion = `Como delantero, ${info.nombre} muestra un promedio de ${golesPorPartido} goles por partido. ${parseFloat(golesPorPartido) > 0.5 ? 'Excelente' : parseFloat(golesPorPartido) > 0.3 ? 'Buena' : 'Moderada'} capacidad goleadora.`;
      break;
    case 'centrocampista':
    case 'midfielder':
      analisisPosicion = `En el mediocampo, ${info.nombre} aporta ${asistenciasPorPartido} asistencias por partido, demostrando ${parseFloat(asistenciasPorPartido) > 0.3 ? 'excelente' : 'buena'} visión de juego y capacidad de creación.`;
      break;
    case 'defensa':
    case 'defender':
      analisisPosicion = `Como defensor, ${info.nombre} proporciona solidez defensiva con ${estadisticas.apariciones} apariciones, mostrando consistencia en su posición.`;
      break;
    default:
      analisisPosicion = `${info.nombre} ha participado en ${estadisticas.apariciones} partidos con un rendimiento versátil.`;
  }
  
  // Análisis de atributos principales
  let analisisAtributos = '';
  if (atributos && Object.keys(atributos).length > 0) {
    const atributosPrincipales = Object.entries(atributos)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    analisisAtributos = `Sus principales fortalezas incluyen: ${atributosPrincipales.map(([attr, valor]) => 
      `${attr} (${valor}/100)`
    ).join(', ')}.`;
  }
  
  // Análisis de valor de mercado
  let analisisValor = '';
  if (contrato.valor_mercado) {
    const valor = contrato.valor_mercado;
    if (valor > 50000000) {
      analisisValor = `Con un valor de mercado de €${(valor / 1000000).toFixed(1)}M, se posiciona como un jugador de elite mundial.`;
    } else if (valor > 20000000) {
      analisisValor = `Su valor de €${(valor / 1000000).toFixed(1)}M refleja su calidad como jugador de primer nivel.`;
    } else if (valor > 5000000) {
      analisisValor = `Valorado en €${(valor / 1000000).toFixed(1)}M, representa una inversión sólida.`;
    } else {
      analisisValor = `Su valoración actual sugiere potencial de crecimiento en el mercado.`;
    }
  }
  
  // Análisis de edad y proyección
  let analisisEdad = '';
  if (info.edad < 23) {
    analisisEdad = `A los ${info.edad} años, se encuentra en una fase de desarrollo con gran potencial de mejora.`;
  } else if (info.edad < 28) {
    analisisEdad = `Con ${info.edad} años, está en su mejor momento profesional, combinando experiencia y capacidad física.`;
  } else if (info.edad < 33) {
    analisisEdad = `A los ${info.edad} años, aporta experiencia y madurez táctica al equipo.`;
  } else {
    analisisEdad = `Su experiencia de ${info.edad} años lo convierte en un referente y mentor para jugadores más jóvenes.`;
  }
  
  return `**ANÁLISIS PROFESIONAL DE ${info.nombre.toUpperCase()}**

**Rendimiento en Campo:**
${analisisPosicion} Su participación constante en ${estadisticas.apariciones} encuentros demuestra la confianza del cuerpo técnico.

**Perfil Técnico:**
${analisisAtributos} ${analisisEdad}

**Evaluación de Mercado:**
${analisisValor}

**Recomendación:**
${info.nombre} presenta un perfil ${info.edad < 25 ? 'prometedor con margen de crecimiento' : info.edad < 30 ? 'consolidado y en su mejor momento' : 'experimentado y confiable'} para el ${info.equipo}. Su contribución de ${estadisticas.goles} goles y ${estadisticas.asistencias} asistencias refleja su impacto directo en el rendimiento del equipo.

*Análisis generado basado en datos actualizados al ${new Date().toLocaleDateString('es-ES')}*`;
}

// POST /api/mcp/analizar-jugador
router.post('/analizar-jugador', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { nombre_jugador } = req.body;
    
    // Validar entrada
    if (!nombre_jugador || typeof nombre_jugador !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Nombre de jugador requerido'
      });
    }

    // Buscar jugador por nombre (usando el servicio existente)
    const resultadoBusqueda = await playersService.searchPlayers(nombre_jugador.trim(), { page: 1, limit: 10 });
    
    if (resultadoBusqueda.players.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado',
        message: `No se encontró ningún jugador con el nombre "${nombre_jugador}"`
      });
    }

    // Tomar el primer resultado (más relevante)
    const jugador = resultadoBusqueda.players[0];
    
    // Obtener datos completos del jugador
    const jugadorCompleto = await playersService.getPlayerById(jugador.id);

    // Formato optimizado para análisis de IA
    const analisisData = {
      jugador: {
        id: jugadorCompleto.id,
        nombre: jugadorCompleto.name,
        posicion: jugadorCompleto.position,
        edad: jugadorCompleto.age,
        equipo: jugadorCompleto.team,
        nacionalidad: jugadorCompleto.nationality
      },
      estadisticas: {
        goles: jugadorCompleto.goals,
        asistencias: jugadorCompleto.assists,
        apariciones: jugadorCompleto.appearances
      },
      atributos: jugadorCompleto.attributes || {},
      contrato: {
        salario_semanal: jugadorCompleto.salary,
        valor_mercado: jugadorCompleto.marketValue,
        fin_contrato: jugadorCompleto.contractEnd
      },
      fisico: {
        altura: jugadorCompleto.height,
        peso: jugadorCompleto.weight
      }
    };

    // Generar análisis IA
    const analisisIA = generarAnalisisIA(analisisData);

    // Respuesta estructurada para MCP
    res.status(200).json({
      success: true,
      message: `Datos encontrados para ${jugadorCompleto.name}`,
      data: {
        ...analisisData,
        analisisIA: analisisIA
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error en analizar-jugador:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudo analizar el jugador'
    });
  }
});

export default router;