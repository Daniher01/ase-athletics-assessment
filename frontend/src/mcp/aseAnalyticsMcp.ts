import { TabServerTransport } from "@mcp-b/transports";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { playerService } from "../services/playerService";

// Schema de validación
const AnalizarJugadorSchema = z.object({
  nombre_jugador: z.string().min(1, "Nombre del jugador es requerido")
});

class ASEAnalyticsMCPServer {
  private server: Server;
  private transport: TabServerTransport | null = null;

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
            description: "Analiza un jugador específico de fútbol obteniendo todas sus estadísticas, atributos y datos de rendimiento",
            inputSchema: {
              type: "object",
              properties: {
                nombre_jugador: {
                  type: "string",
                  description: "Nombre del jugador a analizar (ej: 'Lionel Messi', 'Cristiano Ronaldo')"
                }
              },
              required: ["nombre_jugador"]
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
          
          // Validar argumentos
          const validatedArgs = AnalizarJugadorSchema.parse(args);
          console.log("✅ Argumentos validados:", validatedArgs);
          
          // Disparar evento de loading
          this.updateUIState({ loading: true, error: null });
          
          // Llamar a la API usando el servicio
          const data = await playerService.analizarJugador(validatedArgs.nombre_jugador);
          console.log("✅ Datos recibidos:", data);

          // Navegar a la página de detalle del jugador
          this.navigateToPlayerDetail(data.data);

          // Respuesta estructurada para la IA
          const analisisTexto = this.formatearAnalisisParaIA(data.data);

          return {
            content: [
              {
                type: "text",
                text: analisisTexto
              }
            ]
          };

        } catch (error: any) {
          console.error("❌ Error en análisis:", error);
          
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

      throw new Error(`Herramienta desconocida: ${name}`);
    });
  }

  private formatearAnalisisParaIA(data: any): string {
    return `✅ NAVEGANDO A PERFIL DE ${data.jugador.nombre}

🧭 Te he llevado automáticamente a la página de detalle del jugador donde puedes ver toda la información:

🏈 INFORMACIÓN BÁSICA:
• Posición: ${data.jugador.posicion}
• Edad: ${data.jugador.edad} años  
• Equipo: ${data.jugador.equipo}
• Nacionalidad: ${data.jugador.nacionalidad}

📊 ESTADÍSTICAS TEMPORADA:
• Goles: ${data.estadisticas.goles}
• Asistencias: ${data.estadisticas.asistencias}
• Apariciones: ${data.estadisticas.apariciones}

💰 VALOR DE MERCADO: €${data.contrato.valor_mercado?.toLocaleString() || 'No disponible'}

⚡ ATRIBUTOS PRINCIPALES:
${Object.entries(data.atributos || {}).map(([attr, value]) => 
  `• ${attr.charAt(0).toUpperCase() + attr.slice(1)}: ${value}/100`
).slice(0, 6).join('\n')}

🤖 ANÁLISIS PROFESIONAL IA:
${data.analisisIA || 'Análisis no disponible'}

🔍 Ahora estás viendo el perfil completo del jugador. Puedes pedirme análisis más específicos sobre lo que ves en la página.`;
  }

  private navigateToPlayerDetail(data: any) {
    console.log("🧭 Navegando a PlayerDetail:", data);
    
    const playerId = data.jugador.id;
    if (!playerId) {
      console.error("❌ No se encontró ID del jugador");
      return;
    }

    // Navegar a la página de detalle del jugador
    window.location.href = `/players/${playerId}`;
    
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
      // Crear transporte para extensión Chrome
      this.transport = new TabServerTransport({
        allowedOrigins: [
          window.location.origin, // Origen actual
          "chrome-extension://*", // Cualquier extensión Chrome
        ]
      });

      // Conectar servidor MCP
      await this.server.connect(this.transport);
      
      console.log("🔗 ASE Analytics MCP Server conectado exitosamente");
      console.log("🌐 Origen permitido:", window.location.origin);
      
      // Notificar conexión exitosa
      this.updateUIState({ loading: false, error: null });
      
      return true;
    } catch (error) {
      console.error("❌ Error conectando MCP Server:", error);
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
      console.log("⚠️ MCP Server ya está inicializado");
      return true;
    }

    console.log("🚀 Inicializando ASE Analytics MCP Server...");
    
    mcpServerInstance = new ASEAnalyticsMCPServer();
    const connected = await mcpServerInstance.connect();
    
    if (connected) {
      console.log("✅ MCP Server listo para recibir comandos");
      
      // Hacer disponible globalmente para debugging
      (window as any).aseMcpServer = mcpServerInstance;
      
      return true;
    } else {
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
  return mcpServerInstance !== null;
}