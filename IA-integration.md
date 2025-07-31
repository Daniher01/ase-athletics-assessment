# ASE Athletics - Plan de Integración MCP-B
## Transformando tu Plataforma de Análisis de Fútbol en un Servidor MCP Web

---

## 🎯 Objetivo del MVP

Convertir ASE Athletics en un servidor MCP-B con **UN SOLO CASO DE USO**: analizar un jugador específico mediante IA, donde:

1. **Nueva página**: "Analizar con IA" en el menú principal
2. **Una sola tool MCP**: `analizar_jugador` que recibe el nombre del jugador
3. **Análisis en la web**: Los resultados aparecen en la página web, no solo en el chat de la extensión
4. **API existente**: Aprovechar el endpoint `GET /api/players/:id` que ya tienes

---

## 🏗️ Arquitectura Simplificada

```
Usuario → Página "Analizar con IA" → Extensión Chrome MCP-B → Tool MCP → API /players/:id → Análisis mostrado en la página
```

### Lo que NO cambia (95% de tu app)

- ✅ Toda la aplicación actual sigue igual
- ✅ Todos los endpoints existentes
- ✅ Dashboard, tablas, filtros, etc.
- ✅ Sistema de autenticación

### Lo que SÍ añades (5% nuevo)

- ✅ Nueva página "Analizar con IA"
- ✅ Un nuevo endpoint optimizado para MCP
- ✅ Servidor MCP integrado en el frontend
- ✅ Una sola herramienta: analizar jugador

---

## 🛠️ Plan de Implementación

### Fase 1: Backend - Nuevo Endpoint MCP (30 min)

**Ubicación**: `backend/src/routes/mcp.ts`

```typescript
import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { playersService } from '../services/playersService';

const router = express.Router();

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
    const jugadores = await playersService.searchPlayersByName(nombre_jugador.trim());
    
    if (jugadores.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado',
        message: `No se encontró ningún jugador con el nombre "${nombre_jugador}"`
      });
    }

    // Tomar el primer resultado (más relevante)
    const jugador = jugadores[0];
    
    // Obtener datos completos del jugador
    const jugadorCompleto = await playersService.getPlayerById(jugador.id);

    // Formato optimizado para análisis de IA
    const analisisData = {
      jugador: {
        nombre: jugadorCompleto.name,
        posicion: jugadorCompleto.position,
        edad: jugadorCompleto.age,
        equipo: jugadorCompleto.team,
        nacionalidad: jugadorCompleto.nationality
      },
      estadisticas: {
        goles: jugadorCompleto.goals,
        asistencias: jugadorCompleto.assists,
        apariciones: jugadorCompleto.appearances,
        minutos_jugados: jugadorCompleto.minutesPlayed,
        tarjetas_amarillas: jugadorCompleto.yellowCards,
        tarjetas_rojas: jugadorCompleto.redCards
      },
      atributos: jugadorCompleto.attributes || {},
      contrato: {
        salario_semanal: jugadorCompleto.salary,
        valor_mercado: jugadorCompleto.marketValue,
        fin_contrato: jugadorCompleto.contractEnd
      },
      fisico: {
        altura: jugadorCompleto.height,
        peso: jugadorCompleto.weight,
        pie_preferido: jugadorCompleto.preferredFoot
      }
    };

    // Respuesta estructurada para MCP
    res.status(200).json({
      success: true,
      message: `Datos encontrados para ${jugadorCompleto.name}`,
      data: analisisData,
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
```

**Agregar en server.ts**:

```typescript
import mcpRoutes from './routes/mcp';

// Agregar esta línea con las otras rutas
app.use('/api/mcp', mcpRoutes);
```

### Fase 2: Frontend - Servidor MCP (45 min)

#### 2.1 Instalar Dependencias

```bash
cd frontend
npm install @modelcontextprotocol/sdk zod
```

**Por qué estas dependencias**:

- `@modelcontextprotocol/sdk`: Protocolo estándar para comunicación MCP
- `zod`: Validación de tipos TypeScript (necesario para MCP)

#### 2.2 Crear Servidor MCP

**Ubicación**: `frontend/src/mcp/aseAnalyticsMcp.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Schema de validación para la herramienta
const AnalizarJugadorSchema = z.object({
  nombre_jugador: z.string().min(1, "Nombre del jugador es requerido")
});

class ASEAnalyticsMCPServer {
  private server: Server;

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
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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
      const { name, arguments: args } = request.params;

      if (name === "analizar_jugador") {
        try {
          // Validar argumentos
          const validatedArgs = AnalizarJugadorSchema.parse(args);
          
          // Llamar a la API
          const response = await fetch('/api/mcp/analizar-jugador', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}` // Usar tu token JWT
            },
            body: JSON.stringify(validatedArgs)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al analizar jugador');
          }

          const data = await response.json();

          // Actualizar interfaz de usuario
          this.updateUIWithAnalysis(data.data);

          // Respuesta para la IA
          return {
            content: [
              {
                type: "text",
                text: `✅ ANÁLISIS COMPLETADO para ${data.data.jugador.nombre}

🏈 INFORMACIÓN BÁSICA:
- Posición: ${data.data.jugador.posicion}
- Edad: ${data.data.jugador.edad} años
- Equipo: ${data.data.jugador.equipo}
- Nacionalidad: ${data.data.jugador.nacionalidad}

📊 ESTADÍSTICAS TEMPORADA:
- Goles: ${data.data.estadisticas.goles}
- Asistencias: ${data.data.estadisticas.asistencias}
- Apariciones: ${data.data.estadisticas.apariciones}
- Minutos jugados: ${data.data.estadisticas.minutos_jugados}

💰 VALOR DE MERCADO: €${data.data.contrato.valor_mercado?.toLocaleString() || 'No disponible'}

📈 ATRIBUTOS PRINCIPALES:
${Object.entries(data.data.atributos).map(([attr, value]) => 
  `- ${attr}: ${value}/100`
).join('\n')}

Los datos completos se han cargado en la interfaz web para análisis detallado.`
              }
            ]
          };

        } catch (error: any) {
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

  private updateUIWithAnalysis(data: any) {
    // Disparar evento personalizado para actualizar la UI
    const event = new CustomEvent('mcpAnalysisComplete', {
      detail: data
    });
    window.dispatchEvent(event);
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Server Error]", error);
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log("ASE Analytics MCP Server está ejecutándose");
  }
}

// Inicializar servidor MCP
export async function initializeASEMCP() {
  try {
    const mcpServer = new ASEAnalyticsMCPServer();
    await mcpServer.run();
  } catch (error) {
    console.error("Error inicializando MCP Server:", error);
  }
}
```

#### 2.3 Nueva Página "Analizar con IA"

**Ubicación**: `frontend/src/pages/AnalisisIA/AnalisisIA.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { initializeASEMCP } from '../../mcp/aseAnalyticsMcp';

interface JugadorAnalisis {
  jugador: {
    nombre: string;
    posicion: string;
    edad: number;
    equipo: string;
    nacionalidad: string;
  };
  estadisticas: any;
  atributos: any;
  contrato: any;
  fisico: any;
}

const AnalisisIA: React.FC = () => {
  const [mcpActivo, setMcpActivo] = useState(false);
  const [analisisActual, setAnalisisActual] = useState<JugadorAnalisis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inicializar MCP cuando se monta el componente
    const inicializarMCP = async () => {
      try {
        await initializeASEMCP();
        setMcpActivo(true);
        console.log("✅ MCP Server inicializado");
      } catch (error) {
        console.error("❌ Error inicializando MCP:", error);
      }
    };

    inicializarMCP();

    // Escuchar eventos de análisis completado
    const handleAnalysisComplete = (event: CustomEvent) => {
      setAnalisisActual(event.detail);
      setLoading(false);
    };

    window.addEventListener('mcpAnalysisComplete', handleAnalysisComplete as EventListener);

    return () => {
      window.removeEventListener('mcpAnalysisComplete', handleAnalysisComplete as EventListener);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤖 Analizar Jugador con IA
          </h1>
          <p className="text-lg text-gray-600">
            Usa inteligencia artificial para obtener análisis profundos de cualquier jugador
          </p>
        </div>

        {/* Estado del MCP */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${mcpActivo ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {mcpActivo ? '✅ Servidor MCP activo' : '❌ Servidor MCP inactivo'}
              </span>
            </div>
            
            {mcpActivo && (
              <div className="text-sm text-gray-500">
                💡 Extensión Chrome detectada y conectada
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Cómo usar el análisis con IA:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Asegúrate de tener instalada la extensión Chrome MCP-B</li>
            <li>Abre el chat de la extensión</li>
            <li>Escribe: <code className="bg-blue-100 px-2 py-1 rounded">"Analiza a Lionel Messi"</code></li>
            <li>La IA ejecutará automáticamente la herramienta y mostrará resultados aquí</li>
          </ol>
        </div>

        {/* Área de resultados */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">🤖 IA analizando jugador...</p>
          </div>
        )}

        {analisisActual && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📊 Análisis de {analisisActual.jugador.nombre}
            </h2>
            
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Información Básica</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Posición:</span> {analisisActual.jugador.posicion}</p>
                  <p><span className="font-medium">Edad:</span> {analisisActual.jugador.edad} años</p>
                  <p><span className="font-medium">Equipo:</span> {analisisActual.jugador.equipo}</p>
                  <p><span className="font-medium">Nacionalidad:</span> {analisisActual.jugador.nacionalidad}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">📈 Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Goles:</span> {analisisActual.estadisticas.goles}</p>
                  <p><span className="font-medium">Asistencias:</span> {analisisActual.estadisticas.asistencias}</p>
                  <p><span className="font-medium">Apariciones:</span> {analisisActual.estadisticas.apariciones}</p>
                  <p><span className="font-medium">Minutos:</span> {analisisActual.estadisticas.minutos_jugados}</p>
                </div>
              </div>
            </div>

            {/* Atributos */}
            {Object.keys(analisisActual.atributos).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">⚡ Atributos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analisisActual.atributos).map(([attr, value]) => (
                    <div key={attr} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{attr}:</span>
                        <span className="font-medium">{value}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valor de mercado */}
            {analisisActual.contrato.valor_mercado && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">💰 Valor de Mercado</h3>
                <p className="text-2xl font-bold text-green-600">
                  €{analisisActual.contrato.valor_mercado.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Placeholder inicial */}
        {!analisisActual && !loading && mcpActivo && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Listo para analizar
            </h3>
            <p className="text-gray-600">
              Usa la extensión Chrome para pedirle a la IA que analice cualquier jugador
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisIA;
```

#### 2.4 Agregar Nueva Ruta

**En `frontend/src/App.tsx`** (agregar la nueva ruta):

```tsx
import AnalisisIA from './pages/AnalisisIA/AnalisisIA';

// Agregar en las rutas existentes
<Route path="/analisis-ia" element={<AnalisisIA />} />
```

**En tu componente de navegación** (agregar nuevo item del menú):

```tsx
<NavLink to="/analisis-ia" className="nav-link">
  🤖 Analizar con IA
</NavLink>
```

### Fase 3: Testing (15 min)

#### 3.1 Verificar Backend

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Probar endpoint con curl
curl -X POST http://localhost:5000/api/mcp/analizar-jugador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{"nombre_jugador": "Messi"}'
```

#### 3.2 Verificar Frontend

```bash
# Terminal 2: Frontend  
cd frontend
npm start

# Ir a http://localhost:3000/analisis-ia
```

#### 3.3 Testing con Extensión Chrome

1. **Instalar extensión** MCP-B en Chrome
2. **Visitar** `http://localhost:3000/analisis-ia`
3. **Abrir extensión** y verificar que detecta herramientas
4. **Probar comando**: "Analiza a Lionel Messi"
5. **Verificar** que los resultados aparecen en la página web

---

## 🎯 Casos de Uso para Testing

```
"Analiza a Lionel Messi"
"Quiero ver las estadísticas de Cristiano Ronaldo"
"Analiza el rendimiento de Kylian Mbappé"
"Dame información completa sobre Neymar"
```

---

## 📊 Ventajas de este MVP

### ✅ Lo que SÍ logras

- **Diferenciación competitiva**: Primera plataforma de fútbol con IA integrada
- **Experiencia única**: Chat natural para análisis de jugadores
- **Cero costo API**: Los usuarios usan sus propias cuentas de IA
- **Implementación rápida**: Solo 1.5 horas de desarrollo

### ✅ Lo que mantienes

- **Toda tu app actual** funciona igual
- **Endpoints existentes** sin cambios
- **Sistema de autenticación** se aprovecha
- **Base de datos** sin modificaciones

---

## 🚀 Roadmap Futuro (Post-MVP)

Una vez que funcione este MVP, puedes expandir fácilmente:

1. **Más herramientas MCP**:
    
    - `comparar_jugadores`
    - `buscar_por_posicion`
    - `generar_reporte_scouting`
2. **Análisis más avanzados**:
    
    - Gráficos dinámicos generados por IA
    - Recomendaciones de fichajes
    - Predicciones de rendimiento
3. **Mejoras UX**:
    
    - Historial de análisis
    - Guardar jugadores favoritos
    - Exportar reportes PDF

---

## ⚠️ Consideraciones Importantes

### Seguridad

- ✅ **Autenticación JWT** se mantiene en todas las llamadas MCP
- ✅ **Validación de entrada** con Zod
- ✅ **No exposición** de datos sensibles

### Performance

- ✅ **Un solo endpoint** optimizado
- ✅ **Reutilización** de servicios existentes
- ✅ **Respuestas ligeras** para MCP

### Compatibilidad

- ✅ **Chrome extension** como único requisito
- ✅ **Fallback graceful** si no hay extensión
- ✅ **No afecta** usuarios que no usen IA

### Fase 4: Integración con Extensión Chrome MCP-B (30 min)

#### 4.1 Instalar Dependencias MCP-B

```bash
cd frontend
npm install @mcp-b/transports
```

**Por qué estas dependencias específicas**:

- `@mcp-b/transports`: Comunicación directa con la extensión Chrome MCP-B
- `@mcp-b/client`: Cliente MCP optimizado para navegador

#### 4.2 Crear Servidor MCP-B Compatible

**Reemplazar completamente** `frontend/src/mcp/aseAnalyticsMcp.ts`:

```typescript
import { TabServerTransport } from "@mcp-b/transports";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Schema de validación
const AnalizarJugadorSchema = z.object({
  nombre_jugador: z.string().min(1, "Nombre del jugador es requerido")
});

class ASEAnalyticsMCPServer {
  private server: McpServer;
  private transport: TabServerTransport | null = null;

  constructor() {
    this.server = new McpServer({
      name: "ase-analytics",
      version: "1.0.0",
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Registrar la herramienta de análisis
    this.server.tool(
      "analizar_jugador",
      "Analiza un jugador específico de fútbol obteniendo todas sus estadísticas, atributos y datos de rendimiento",
      {
        type: "object",
        properties: {
          nombre_jugador: {
            type: "string",
            description: "Nombre del jugador a analizar (ej: 'Lionel Messi', 'Cristiano Ronaldo')"
          }
        },
        required: ["nombre_jugador"]
      },
      async (args) => {
        try {
          console.log("🔄 Ejecutando análisis de jugador:", args);
          
          // Validar argumentos
          const validatedArgs = AnalizarJugadorSchema.parse(args);
          
          // Disparar evento de loading
          this.updateUIState({ loading: true, error: null });
          
          // Obtener token JWT del localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No hay sesión activa. Por favor, inicia sesión.');
          }

          // Llamar a la API
          const response = await fetch('/api/mcp/analizar-jugador', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedArgs)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al analizar jugador');
          }

          const data = await response.json();
          console.log("✅ Datos recibidos:", data);

          // Actualizar interfaz de usuario
          this.updateUIWithAnalysis(data.data);

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
    );
  }

  private formatearAnalisisParaIA(data: any): string {
    return `✅ ANÁLISIS COMPLETADO para ${data.jugador.nombre}

🏈 INFORMACIÓN BÁSICA:
• Posición: ${data.jugador.posicion}
• Edad: ${data.jugador.edad} años  
• Equipo: ${data.jugador.equipo}
• Nacionalidad: ${data.jugador.nacionalidad}

📊 ESTADÍSTICAS TEMPORADA:
• Goles: ${data.estadisticas.goles}
• Asistencias: ${data.estadisticas.asistencias}
• Apariciones: ${data.estadisticas.apariciones}
• Minutos jugados: ${data.estadisticas.minutos_jugados?.toLocaleString() || 'N/A'}

💰 VALOR DE MERCADO: €${data.contrato.valor_mercado?.toLocaleString() || 'No disponible'}

⚡ ATRIBUTOS PRINCIPALES:
${Object.entries(data.atributos || {}).map(([attr, value]) => 
  `• ${attr.charAt(0).toUpperCase() + attr.slice(1)}: ${value}/100`
).slice(0, 6).join('\n')}

🔍 Los datos completos y gráficos detallados se han cargado en la página web para análisis profundo.`;
  }

  private updateUIWithAnalysis(data: any) {
    console.log("📡 Enviando datos a UI:", data);
    
    // Disparar evento personalizado para actualizar la UI
    const event = new CustomEvent('mcpAnalysisComplete', {
      detail: data
    });
    window.dispatchEvent(event);
    
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
```

#### 4.3 Actualizar Componente React

**Actualizar** `frontend/src/pages/AnalisisIA/AnalisisIA.tsx`:

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { initializeASEMCP, cleanupASEMCP, isMCPActive } from '../../mcp/aseAnalyticsMcp';

interface JugadorAnalisis {
  jugador: {
    nombre: string;
    posicion: string;
    edad: number;
    equipo: string;
    nacionalidad: string;
  };
  estadisticas: any;
  atributos: any;
  contrato: any;
  fisico: any;
}

const AnalisisIA: React.FC = () => {
  const [mcpActivo, setMcpActivo] = useState(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [analisisActual, setAnalisisActual] = useState<JugadorAnalisis | null>(null);
  const [loading, setLoading] = useState(false);
  const [inicializando, setInicializando] = useState(true);

  // Manejar cambios de estado MCP
  const handleMCPStateChange = useCallback((event: CustomEvent) => {
    const { loading: newLoading, error } = event.detail;
    
    if (newLoading !== undefined) {
      setLoading(newLoading);
    }
    
    if (error !== undefined) {
      setMcpError(error);
    }
  }, []);

  // Manejar análisis completado
  const handleAnalysisComplete = useCallback((event: CustomEvent) => {
    console.log("📊 Análisis recibido en UI:", event.detail);
    setAnalisisActual(event.detail);
    setLoading(false);
  }, []);

  // Función para reconectar MCP
  const reconectarMCP = async () => {
    setInicializando(true);
    setMcpError(null);
    
    // Limpiar instancia anterior
    cleanupASEMCP();
    
    // Intentar nueva conexión
    const conectado = await initializeASEMCP();
    setMcpActivo(conectado);
    setInicializando(false);
    
    if (!conectado) {
      setMcpError("No se pudo conectar con la extensión MCP-B");
    }
  };

  useEffect(() => {
    // Inicializar MCP cuando se monta el componente
    const inicializarMCP = async () => {
      console.log("🔄 Montando componente AnalisisIA...");
      
      // Verificar si la extensión está disponible
      if (!window.chrome?.runtime) {
        setMcpError("Extensión Chrome MCP-B no detectada");
        setInicializando(false);
        return;
      }

      try {
        const conectado = await initializeASEMCP();
        setMcpActivo(conectado);
        
        if (!conectado) {
          setMcpError("Error al conectar con MCP-B");
        }
      } catch (error: any) {
        console.error("❌ Error inicializando MCP:", error);
        setMcpError(`Error de inicialización: ${error.message}`);
      } finally {
        setInicializando(false);
      }
    };

    inicializarMCP();

    // Registrar listeners de eventos
    window.addEventListener('mcpAnalysisComplete', handleAnalysisComplete as EventListener);
    window.addEventListener('mcpStateChange', handleMCPStateChange as EventListener);

    // Cleanup al desmontar
    return () => {
      window.removeEventListener('mcpAnalysisComplete', handleAnalysisComplete as EventListener);
      window.removeEventListener('mcpStateChange', handleMCPStateChange as EventListener);
      cleanupASEMCP();
    };
  }, [handleAnalysisComplete, handleMCPStateChange]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🤖 Analizar Jugador con IA
          </h1>
          <p className="text-lg text-gray-600">
            Usa inteligencia artificial para obtener análisis profundos de cualquier jugador
          </p>
        </div>

        {/* Estado del MCP */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {inicializando ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="font-medium">🔄 Inicializando MCP...</span>
                </>
              ) : mcpActivo ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">✅ Servidor MCP activo y conectado</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">❌ Servidor MCP inactivo</span>
                </>
              )}
            </div>
            
            {mcpActivo && (
              <div className="text-sm text-green-600">
                🔗 Extensión MCP-B conectada
              </div>
            )}
            
            {mcpError && !inicializando && (
              <button 
                onClick={reconectarMCP}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                🔄 Reconectar
              </button>
            )}
          </div>
          
          {mcpError && (
            <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
              ⚠️ {mcpError}
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 Cómo usar el análisis con IA:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Asegúrate de tener instalada la <strong>extensión Chrome MCP-B</strong></li>
            <li>Verifica que el estado arriba muestre "Servidor MCP activo"</li>
            <li>Abre el chat de la extensión MCP-B</li>
            <li>Escribe: <code className="bg-blue-100 px-2 py-1 rounded">"Analiza a Lionel Messi"</code></li>
            <li>La IA ejecutará automáticamente la herramienta y mostrará resultados aquí</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              💡 <strong>Debug info:</strong> Si tienes problemas, abre las Dev Tools (F12) 
              y revisa la consola para ver los logs de conexión MCP.
            </p>
          </div>
        </div>

        {/* Área de resultados */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">🤖 IA analizando jugador...</p>
          </div>
        )}

        {analisisActual && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              📊 Análisis de {analisisActual.jugador.nombre}
              <span className="ml-3 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                ✅ Completado
              </span>
            </h2>
            
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Información Básica</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Posición:</span> {analisisActual.jugador.posicion}</p>
                  <p><span className="font-medium">Edad:</span> {analisisActual.jugador.edad} años</p>
                  <p><span className="font-medium">Equipo:</span> {analisisActual.jugador.equipo}</p>
                  <p><span className="font-medium">Nacionalidad:</span> {analisisActual.jugador.nacionalidad}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">📈 Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Goles:</span> {analisisActual.estadisticas.goles}</p>
                  <p><span className="font-medium">Asistencias:</span> {analisisActual.estadisticas.asistencias}</p>
                  <p><span className="font-medium">Apariciones:</span> {analisisActual.estadisticas.apariciones}</p>
                  <p><span className="font-medium">Minutos:</span> {analisisActual.estadisticas.minutos_jugados?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Atributos */}
            {analisisActual.atributos && Object.keys(analisisActual.atributos).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">⚡ Atributos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(analisisActual.atributos).map(([attr, value]) => (
                    <div key={attr} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{attr}:</span>
                        <span className="font-medium">{value}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valor de mercado */}
            {analisisActual.contrato?.valor_mercado && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">💰 Valor de Mercado</h3>
                <p className="text-2xl font-bold text-green-600">
                  €{analisisActual.contrato.valor_mercado.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Placeholder inicial */}
        {!analisisActual && !loading && !inicializando && mcpActivo && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Listo para analizar
            </h3>
            <p className="text-gray-600 mb-4">
              Usa la extensión Chrome MCP-B para pedirle a la IA que analice cualquier jugador
            </p>
            <div className="text-sm text-gray-500">
              Comandos de ejemplo: "Analiza a Messi", "Quiero ver datos de Ronaldo"
            </div>
          </div>
        )}

        {/* Estado de error o sin extensión */}
        {!inicializando && !mcpActivo && (
          <div className="bg-red-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">
              Extensión MCP-B no detectada
            </h3>
            <p className="text-red-700 mb-4">
              Para usar esta función necesitas instalar la extensión Chrome MCP-B
            </p>
            <button 
              onClick={reconectarMCP}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              🔄 Intentar reconectar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisIA;
```

#### 4.4 Verificar Detección de la Extensión

**Crear archivo** `frontend/public/mcp-manifest.json`:

```json
{
  "name": "ASE Analytics",
  "description": "Plataforma de análisis de fútbol con IA integrada",
  "version": "1.0.0",
  "capabilities": {
    "tools": ["analizar_jugador"]
  },
  "origin": "http://localhost:3000",
  "transport": "tab"
}
```

**Agregar en** `frontend/public/index.html` (dentro del `<head>`):

```html
<!-- Metadatos para MCP-B -->
<meta name="mcp-server" content="true">
<meta name="mcp-version" content="1.0.0">
<meta name="mcp-name" content="ASE Analytics">
<link rel="mcp-manifest" href="/mcp-manifest.json">
```

#### 4.5 Debug y Verificación

**Agregar en tu console del browser** (para debug):

```javascript
// Verificar si la extensión está disponible
console.log("Chrome runtime:", !!window.chrome?.runtime);

// Verificar servidor MCP
console.log("MCP Server:", window.aseMcpServer);

// Verificar eventos
window.addEventListener('message', (event) => {
  if (event.data.type === 'mcp') {
    console.log("Mensaje MCP recibido:", event.data);
  }
});
```


---

## 📋 Checklist de Implementación

### Backend (30 min)

- [ ] Crear `/backend/src/routes/mcp.ts`
- [ ] Agregar `app.use('/api/mcp', mcpRoutes)` en server.ts
- [ ] Probar endpoint con Postman/curl

### Frontend (45 min)

- [ ] Instalar dependencias: `npm install @modelcontextprotocol/sdk zod`
- [ ] Crear `/frontend/src/mcp/aseAnalyticsMcp.ts`
- [ ] Crear `/frontend/src/pages/AnalisisIA/AnalisisIA.tsx`
- [ ] Agregar ruta en App.tsx
- [ ] Agregar ítem en menú de navegación

### Testing (15 min)

- [ ] Verificar backend con curl
- [ ] Verificar frontend carga correctamente
- [ ] Instalar extensión Chrome MCP-B
- [ ] Probar comando "Analiza a Messi"
- [ ] Verificar resultados en página web

---

## 🎉 Resultado Esperado

Al completar este MVP tendrás:

1. **Una nueva página** "Analizar con IA" en tu aplicación
2. **Integración MCP-B** funcionando con una herramienta
3. **Análisis por voz natural**: "Analiza a Messi" → Resultados en la web
4. **Diferenciación competitiva** única en el mercado
5. **Base sólida** para expandir más herramientas de IA

**Tiempo total estimado**: 1.5 horas **Complejidad**: Baja (aprovechar infraestructura existente) **Impacto**: Alto (feature innovadora y diferenciadora)