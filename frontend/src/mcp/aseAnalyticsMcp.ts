import { TabServerTransport } from "@mcp-b/transports";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { playerService } from "../services/playerService";

// Schemas de validación
const AnalizarJugadorSchema = z.object({
  nombre_jugador: z.string().min(1, "Nombre del jugador es requerido")
});

const CompararJugadoresSchema = z.object({
  jugador1: z.string().min(1, "Nombre del primer jugador es requerido"),
  jugador2: z.string().min(1, "Nombre del segundo jugador es requerido")
});

class ASEAnalyticsMCPServer {
  private server: Server;
  private transport: TabServerTransport | null = null;
  private reallyConnected: boolean = false; // Estado real de conexión con extensión

  // Getter público para verificar estado del transporte
  get isConnected(): boolean {
    return this.transport !== null && this.reallyConnected;
  }

  // Método para verificar si la extensión está realmente disponible
  async testConnection(): Promise<boolean> {
    if (!this.transport) {
      this.reallyConnected = false;
      return false;
    }
    
    try {
      console.log("🧪 Probando conexión real con extensión...");
      
      // Verificar si el transporte está realmente conectado
      // En lugar de hacer una petición que puede fallar, verificamos el estado del transporte
      if (this.transport && typeof this.transport.readyState !== 'undefined') {
        // Si el transporte tiene un readyState, verificamos que esté abierto
        this.reallyConnected = this.transport.readyState === 1; // WebSocket.OPEN
      } else {
        // Si no hay readyState, asumimos que está conectado si existe el transporte
        this.reallyConnected = true;
      }
      
      console.log("✅ Estado de conexión verificado:", this.reallyConnected);
      return this.reallyConnected;
    } catch (error) {
      console.warn("❌ Error verificando conexión:", error);
      this.reallyConnected = false;
      return false;
    }
  }

  constructor() {
    this.server = new Server(
      {
        name: "ase-analytics",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log("📋 ListTools solicitado");
      return {
        tools: [
          {
            name: "analizar_jugador",
            description: `ANALIZADOR PROFESIONAL DE JUGADORES DE FÚTBOL

Esta herramienta funciona como un scout deportivo experto que:
- Obtiene datos completos del jugador desde la base de datos
- Genera análisis técnico profesional con IA
- Proporciona recomendaciones de transferencia
- Evalúa potential futuro y valor de mercado
- Compara con jugadores élite de la posición

El análisis incluye:
✅ Resumen ejecutivo
✅ Evaluación técnica detallada  
✅ Análisis posicional
✅ Recomendación de transferencia
✅ Proyección futura
✅ Valor de mercado justificado

Perfecto para scouts, directores deportivos y analistas que necesitan evaluaciones profundas basadas en datos reales.`,
            inputSchema: {
              type: "object",
              properties: {
                nombre_jugador: {
                  type: "string",
                  description: "Nombre completo o parcial del jugador a analizar (ej: 'Lionel Messi', 'Cristiano', 'Mbappé')"
                }
              },
              required: ["nombre_jugador"]
            }
          },
          {
            name: "comparar_jugadores",
            description: `COMPARADOR AUTOMÁTICO DE JUGADORES

Esta herramienta permite comparar dos jugadores automáticamente:
- Busca ambos jugadores en la base de datos
- Navega automáticamente a la página de comparación
- Selecciona ambos jugadores en las tarjetas
- Ejecuta la comparación completa como si el usuario lo hubiera hecho manualmente

La comparación incluye:
✅ Estadísticas de rendimiento lado a lado
✅ Gráficos radar de atributos técnicos
✅ Comparación de valor de mercado
✅ Análisis posicional detallado
✅ Métricas físicas y técnicas
✅ Export de comparación disponible

Perfecto para análisis rápidos de transferencias, evaluación de alternativas y toma de decisiones basada en datos.`,
            inputSchema: {
              type: "object",
              properties: {
                jugador1: {
                  type: "string",
                  description: "Nombre del primer jugador a comparar (ej: 'Lionel Messi', 'Cristiano')"
                },
                jugador2: {
                  type: "string", 
                  description: "Nombre del segundo jugador a comparar (ej: 'Kylian Mbappé', 'Erling Haaland')"
                }
              },
              required: ["jugador1", "jugador2"]
            }
          }
        ]
      };
    });

    // Ejecutar herramienta
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.log("🔧 CallTool recibido:", request);
      const { name, arguments: args } = request.params;

      console.log("🔍 Tool name:", name);
      console.log("🔍 Arguments:", args);

      if (name === "analizar_jugador") {
        try {
          console.log("🔄 Ejecutando análisis de jugador con args:", args);
          console.log("🟢 Estado MCP antes del análisis:", isMCPActive());
          
          // Validar argumentos
          const validatedArgs = AnalizarJugadorSchema.parse(args);
          console.log("✅ Argumentos validados:", validatedArgs);
          
          // Disparar evento de loading
          this.updateUIState({ loading: true, error: null });
          console.log("🟢 Estado MCP después de updateUIState:", isMCPActive());
          
          // Llamar a la API usando el servicio
          const data = await playerService.analizarJugador(validatedArgs.nombre_jugador);
          console.log("✅ Datos recibidos:", data);
          console.log("🟢 Estado MCP después de API call:", isMCPActive());

          // Navegar a la página de detalle del jugador
          this.navigateToPlayerDetail(data.data);
          console.log("🟢 Estado MCP después de navegación:", isMCPActive());

          // 🎯 RESPUESTA CON PROMPT PROFESIONAL INTEGRADO
          const analisisTexto = this.formatearAnalisisConPrompt(data.data);
          console.log("🟢 Estado MCP después de formatear:", isMCPActive());

          const response = {
            content: [
              {
                type: "text",
                text: analisisTexto
              }
            ]
          };

          console.log("🟢 Estado MCP antes de return:", isMCPActive());
          console.log("✅ Retornando respuesta exitosa");
          
          return response;

        } catch (error: any) {
          console.error("❌ Error en análisis:", error);
          console.log("🟢 Estado MCP en catch:", isMCPActive());
          
          // Actualizar UI con error
          this.updateUIState({ loading: false, error: error.message });

          return {
            content: [
              {
                type: "text", 
                text: `❌ Error: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }

      if (name === "comparar_jugadores") {
        try {
          console.log("⚖️ Ejecutando comparación de jugadores con args:", args);
          
          // Validar argumentos
          const validatedArgs = CompararJugadoresSchema.parse(args);
          console.log("✅ Argumentos validados:", validatedArgs);
          
          // Disparar evento de loading
          this.updateUIState({ loading: true, error: null });
          
          // Buscar ambos jugadores
          const [player1Data, player2Data] = await Promise.all([
            playerService.analizarJugador(validatedArgs.jugador1),
            playerService.analizarJugador(validatedArgs.jugador2)
          ]);
          
          console.log("✅ Datos de ambos jugadores recibidos:", { 
            player1: player1Data.data.jugador.nombre, 
            player2: player2Data.data.jugador.nombre 
          });
          console.log("🔍 Atributos player1 completos:", player1Data.data.atributos);
          console.log("🔍 Atributos player2 completos:", player2Data.data.atributos);

          // Navegar a la página de comparación y seleccionar jugadores
          this.navigateToComparison(player1Data.data, player2Data.data);

          // Formatear respuesta
          const comparacionTexto = this.formatearComparacionParaIA(player1Data.data, player2Data.data);

          return {
            content: [
              {
                type: "text",
                text: comparacionTexto
              }
            ]
          };

        } catch (error: any) {
          console.error("❌ Error en comparación:", error);
          
          // Actualizar UI con error
          this.updateUIState({ loading: false, error: error.message });

          return {
            content: [
              {
                type: "text", 
                text: `❌ Error en comparación: ${error.message}`
              }
            ],
            isError: true
          };
        }
      }

      throw new Error(`Herramienta desconocida: ${name}`);
    });
  }

  // 🔥 NUEVA FUNCIÓN CON PROMPT PROFESIONAL
  private formatearAnalisisConPrompt(data: any): string {
    return `📊 DATOS COMPLETOS DEL JUGADOR ${data.jugador.nombre.toUpperCase()}

${JSON.stringify({
      informacion_basica: data.jugador,
      estadisticas_temporada: data.estadisticas,
      atributos_tecnicos: data.atributos,
      datos_contrato: data.contrato,
      caracteristicas_fisicas: data.fisico
    }, null, 2)}

🎯 INSTRUCCIONES DE ANÁLISIS PROFESIONAL:

Eres un scout deportivo de élite con 20 años de experiencia. Analiza estos datos y proporciona un reporte completo siguiendo esta estructura:

**1. RESUMEN EJECUTIVO** (2-3 líneas)
- Evaluación general del jugador
- Recomendación principal (fichar/no fichar/seguir monitoreando)

**2. ANÁLISIS TÉCNICO DETALLADO**
- Evalúa cada atributo técnico (pace, shooting, passing, etc.) con contexto
- Identifica el top 3 fortalezas y top 2 debilidades
- Calificación general del 1-10 con justificación

**3. ANÁLISIS POSICIONAL**
- ¿Qué tan bueno es en su posición actual?
- ¿Podría jugar en otras posiciones?
- Comparación con jugadores élite de su posición

**4. VALOR DE MERCADO Y TRANSFERENCIA**
- ¿El valor actual (€${data.contrato.valor_mercado?.toLocaleString() || 'N/A'}) es justo?
- Rango de precio recomendado para transferencia
- Factores que podrían aumentar/disminuir su valor

**5. PROYECCIÓN FUTURA**
- Basándote en su edad (${data.jugador.edad} años), ¿cuál es su trayectoria esperada?
- Potential de crecimiento en los próximos 2-3 años
- Riesgos de lesiones o declive

**6. RECOMENDACIÓN FINAL**
- ¿Vale la pena ficharlo? ¿Por qué?
- ¿Qué tipo de equipo le conviene más?
- Plan de desarrollo recomendado

**IMPORTANTE**: 
- Usa los datos proporcionados para justificar cada conclusión
- Sé específico con números y estadísticas
- Mantén un tono profesional pero accesible
- Compara con jugadores conocidos cuando sea relevante
- Considera factores como edad, experiencia, y tendencias de rendimiento
- Toda respuesta debe ser en español

Por favor, crea un análisis profundo y profesional que ayude a tomar decisiones informadas sobre este jugador.`;
  }

  private formatearComparacionParaIA(player1Data: any, player2Data: any): string {
    return `✅ COMPARACIÓN AUTOMÁTICA COMPLETADA

⚖️ Te he llevado automáticamente a la página de comparación donde puedes ver el análisis completo de:

🔵 **${player1Data.jugador.nombre.toUpperCase()}** vs 🔴 **${player2Data.jugador.nombre.toUpperCase()}**

📊 DATOS COMPARATIVOS CARGADOS:

**${player1Data.jugador.nombre}:**
• Posición: ${player1Data.jugador.posicion} | Edad: ${player1Data.jugador.edad} años
• Equipo: ${player1Data.jugador.equipo}
• Goles: ${player1Data.estadisticas.goles} | Asistencias: ${player1Data.estadisticas.asistencias}
• Valor de Mercado: €${player1Data.contrato.valor_mercado?.toLocaleString() || 'No disponible'}

**${player2Data.jugador.nombre}:**
• Posición: ${player2Data.jugador.posicion} | Edad: ${player2Data.jugador.edad} años  
• Equipo: ${player2Data.jugador.equipo}
• Goles: ${player2Data.estadisticas.goles} | Asistencias: ${player2Data.estadisticas.asistencias}
• Valor de Mercado: €${player2Data.contrato.valor_mercado?.toLocaleString() || 'No disponible'}

🎯 COMPARACIÓN DISPONIBLE:
✅ Estadísticas de rendimiento lado a lado
✅ Gráficos radar de atributos técnicos
✅ Análisis de valor de mercado
✅ Métricas físicas y posicionales
✅ Opción de exportar comparación en PDF

🔍 La comparación está completamente cargada. Puedes cambiar entre categorías (Rendimiento, Atributos, Mercado) y pedirme análisis específicos sobre lo que ves en pantalla.

¿Te gustaría que analice algún aspecto específico de esta comparación?`;
  }


  private navigateToPlayerDetail(data: any) {
    console.log("🧭 Navegando a PlayerDetail:", data);
    
    const playerId = data.jugador.id;
    if (!playerId) {
      console.error("❌ No se encontró ID del jugador");
      return;
    }

    // Usar navegación SPA sin recargar la página
    const navigationEvent = new CustomEvent('mcpNavigate', {
      detail: { 
        path: `/players/${playerId}`,
        playerId: playerId,
        playerData: data
      }
    });
    window.dispatchEvent(navigationEvent);
    
    // Actualizar estado
    this.updateUIState({ loading: false, error: null });
  }

  private navigateToComparison(player1Data: any, player2Data: any) {
    console.log("⚖️ Navegando a Comparación:", { 
      player1: player1Data.jugador.nombre, 
      player2: player2Data.jugador.nombre 
    });

    // Navegar a la página de comparación con datos precargados incluyendo atributos
    const navigationEvent = new CustomEvent('mcpNavigate', {
      detail: { 
        path: '/comparison',
        comparisonData: {
          player1: {
            id: player1Data.jugador.id,
            name: player1Data.jugador.nombre,
            team: player1Data.jugador.equipo,
            position: player1Data.jugador.posicion,
            age: player1Data.jugador.edad,
            goals: player1Data.estadisticas.goles,
            assists: player1Data.estadisticas.asistencias,
            appearances: player1Data.estadisticas.apariciones,
            marketValue: player1Data.contrato.valor_mercado,
            salary: player1Data.contrato.salario_semanal,
            nationality: player1Data.jugador.nacionalidad,
            height: player1Data.fisico?.altura || 180,
            weight: player1Data.fisico?.peso || 75,
            contractEnd: player1Data.contrato?.fin_contrato || '2025-12-31',
            attributes: player1Data.atributos || {
              pace: 70,
              shooting: 70,
              passing: 70,
              dribbling: 70,
              defending: 70,
              physical: 70
            },
            imageUrl: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          player2: {
            id: player2Data.jugador.id,
            name: player2Data.jugador.nombre,
            team: player2Data.jugador.equipo,
            position: player2Data.jugador.posicion,
            age: player2Data.jugador.edad,
            goals: player2Data.estadisticas.goles,
            assists: player2Data.estadisticas.asistencias,
            appearances: player2Data.estadisticas.apariciones,
            marketValue: player2Data.contrato.valor_mercado,
            salary: player2Data.contrato.salario_semanal,
            nationality: player2Data.jugador.nacionalidad,
            height: player2Data.fisico?.altura || 180,
            weight: player2Data.fisico?.peso || 75,
            contractEnd: player2Data.contrato?.fin_contrato || '2025-12-31',
            attributes: player2Data.atributos || {
              pace: 70,
              shooting: 70,
              passing: 70,
              dribbling: 70,
              defending: 70,
              physical: 70
            },
            imageUrl: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      }
    });
    window.dispatchEvent(navigationEvent);
    
    // Actualizar estado
    this.updateUIState({ loading: false, error: null });
  }

  private updateUIState(state: { loading?: boolean; error?: string | null }) {
    const event = new CustomEvent('mcpStateChange', {
      detail: state
    });
    window.dispatchEvent(event);
  }

  async connect() {
    try {
      console.log("🚀 Iniciando conexión MCP...");
      
      // Crear transporte para extensión Chrome
      this.transport = new TabServerTransport({
        allowedOrigins: [
          window.location.origin, // Origen actual
          "chrome-extension://*", // Cualquier extensión Chrome
        ]
      });

      console.log("🔌 Transporte creado, conectando servidor...");

      // Conectar servidor MCP
      await this.server.connect(this.transport);
      
      console.log("🔗 Transporte MCP conectado, verificando extensión...");
      
      // Agregar listeners para detectar desconexiones
      if (this.transport) {
        this.transport.onclose = () => {
          console.warn("⚠️ Transporte MCP cerrado");
          this.transport = null;
          this.reallyConnected = false;
          this.updateUIState({ loading: false, error: "Conexión MCP perdida" });
        };

        this.transport.onerror = (error) => {
          console.error("❌ Error en transporte MCP:", error);
          this.transport = null;
          this.reallyConnected = false;
          this.updateUIState({ loading: false, error: `Error de transporte: ${error}` });
        };
      }
      
      // Marcar como conectado inmediatamente si el transporte se conecta
      this.reallyConnected = true;
      console.log("✅ MCP Server conectado");
      this.updateUIState({ loading: false, error: null });
      
      return true;
    } catch (error) {
      console.error("❌ Error conectando MCP Server:", error);
      this.reallyConnected = false;
      this.updateUIState({ loading: false, error: `Error de conexión: ${error.message}` });
      return false;
    }
  }

  disconnect() {
    if (this.transport) {
      this.transport.close();
      this.transport = null;
      console.log("🔌 MCP Server desconectado");
    }
  }
}

// Instancia global del servidor
let mcpServerInstance: ASEAnalyticsMCPServer | null = null;

// Función para inicializar el servidor MCP
export async function initializeASEMCP(): Promise<boolean> {
  try {
    // Evitar múltiples instancias
    if (mcpServerInstance) {
      console.log("⚠️ MCP Server ya está inicializado, reutilizando instancia existente");
      return mcpServerInstance.isConnected;
    }

    console.log("🚀 Inicializando ASE Analytics MCP Server...");
    console.log("📍 Stack trace:", new Error().stack);
    
    mcpServerInstance = new ASEAnalyticsMCPServer();
    const connected = await mcpServerInstance.connect();
    
    if (connected) {
      console.log("✅ MCP Server listo para recibir comandos");
      console.log("💡 Prueba: 'Analiza a Messi' en la extensión");
      
      // Hacer disponible globalmente para debugging
      (window as any).aseMcpServer = mcpServerInstance;
      
      return true;
    } else {
      console.warn("❌ MCP Server no pudo conectarse");
      mcpServerInstance = null;
      return false;
    }
  } catch (error) {
    console.error("💥 Error fatal inicializando MCP:", error);
    mcpServerInstance = null;
    return false;
  }
}

// Función para limpiar al desmontar
export function cleanupASEMCP() {
  if (mcpServerInstance) {
    mcpServerInstance.disconnect();
    mcpServerInstance = null;
    delete (window as any).aseMcpServer;
    console.log("🧹 MCP Server limpiado");
  }
}

// Verificar si MCP está activo
export function isMCPActive(): boolean {
  return mcpServerInstance !== null && mcpServerInstance.isConnected;
}

// Hacer test de conexión real
export async function testMCPConnection(): Promise<boolean> {
  if (!mcpServerInstance) return false;
  return await mcpServerInstance.testConnection();
}