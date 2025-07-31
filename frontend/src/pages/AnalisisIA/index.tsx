import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/common/Layout';
import { initializeASEMCP, cleanupASEMCP, isMCPActive } from '../../mcp/aseAnalyticsMcp';

interface JugadorAnalisis {
  jugador: {
    nombre: string;
    posicion: string;
    edad: number;
    equipo: string;
    nacionalidad: string;
  };
  estadisticas: {
    goles: number;
    asistencias: number;
    apariciones: number;
  };
  atributos: any;
  contrato: {
    salario_semanal: number;
    valor_mercado: number;
    fin_contrato: string;
  };
  fisico: {
    altura: number;
    peso: number;
  };
}

const AnalisisIA: React.FC = () => {
  const [mcpActivo, setMcpActivo] = useState(() => isMCPActive());
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [analisisActual, setAnalisisActual] = useState<JugadorAnalisis | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Función para conectar MCP manualmente
  const conectarMCP = async () => {
    setMcpError(null);
    
    try {
      const conectado = await initializeASEMCP();
      setMcpActivo(conectado);
      
      if (!conectado) {
        setMcpError("No se pudo conectar con la extensión MCP-B");
      }
    } catch (error: any) {
      console.error("❌ Error conectando MCP:", error);
      setMcpError(`Error de conexión: ${error.message}`);
    }
  };

  // Función para mostrar instrucciones de la extensión
  const mostrarInstrucciones = () => {
    alert(`📱 Para usar el análisis con IA:

1. Haz clic en el icono de extensiones (🧩) en la barra de Chrome
2. Busca y haz clic en la extensión 'MCP-B' 
3. En el chat de la extensión, escribe comandos como:
   • "Analiza a Lionel Messi"
   • "Quiero ver datos de Cristiano Ronaldo"
   • "Analiza el rendimiento de Neymar"

Los resultados aparecerán automáticamente en esta página.`);
  };

  useEffect(() => {
    console.log("🔄 Componente AnalisisIA montado");
    
    // Solo verificar estado actual, no inicializar automáticamente
    setMcpActivo(isMCPActive());

    // Registrar listeners de eventos
    window.addEventListener('mcpAnalysisComplete', handleAnalysisComplete as EventListener);
    window.addEventListener('mcpStateChange', handleMCPStateChange as EventListener);

    // Cleanup al desmontar
    return () => {
      window.removeEventListener('mcpAnalysisComplete', handleAnalysisComplete as EventListener);
      window.removeEventListener('mcpStateChange', handleMCPStateChange as EventListener);
    };
  }, [handleAnalysisComplete, handleMCPStateChange]);

  return (
    <Layout>
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
              {mcpActivo ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">✅ Servidor MCP activo y conectado</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">⚠️ MCP no iniciado - Haz clic en "Conectar"</span>
                </>
              )}
            </div>
            
            {mcpActivo && (
              <div className="text-sm text-green-600">
                🔗 Extensión MCP-B conectada
              </div>
            )}
            
            {!mcpActivo && (
              <button 
                onClick={conectarMCP}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                🚀 Conectar MCP
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
            <li>Haz clic en el icono de extensiones (🧩) en la barra de Chrome</li>
            <li>Busca y haz clic en la extensión <strong>MCP-B</strong></li>
            <li>En el chat, escribe: <code className="bg-blue-100 px-2 py-1 rounded">"Analiza a Lionel Messi"</code></li>
            <li>Los resultados aparecerán automáticamente en esta página</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> No es posible abrir automáticamente la extensión por seguridad de Chrome. 
              Debes abrirla manualmente desde el icono de extensiones (🧩).
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
                </div>
              </div>
            </div>

            {/* Datos físicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">🏃 Datos Físicos</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Altura:</span> {analisisActual.fisico.altura} cm</p>
                  <p><span className="font-medium">Peso:</span> {analisisActual.fisico.peso} kg</p>
                </div>
              </div>

              {/* Valor de mercado */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">💰 Valor de Mercado</h3>
                <p className="text-xl font-bold text-green-600">
                  €{analisisActual.contrato.valor_mercado?.toLocaleString() || 'No disponible'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Salario semanal:</span> €{analisisActual.contrato.salario_semanal?.toLocaleString() || 'No disponible'}
                </p>
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
          </div>
        )}

        {/* Placeholder inicial */}
        {!analisisActual && !loading && mcpActivo && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Listo para analizar
            </h3>
            <p className="text-gray-600 mb-4">
              Usa la extensión Chrome MCP-B para pedirle a la IA que analice cualquier jugador
            </p>
            <div className="text-sm text-gray-500 mb-4">
              Comandos de ejemplo: "Analiza a Messi", "Quiero ver datos de Ronaldo"
            </div>
            <button 
              onClick={mostrarInstrucciones}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              📋 Ver instrucciones detalladas
            </button>
          </div>
        )}

        {/* Estado inicial sin conexión */}
        {!analisisActual && !loading && !mcpActivo && (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              Conecta con MCP para empezar
            </h3>
            <p className="text-blue-700 mb-4">
              Haz clic en "Conectar MCP" arriba para inicializar la conexión con la extensión
            </p>
            <button 
              onClick={conectarMCP}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              🚀 Conectar ahora
            </button>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default AnalisisIA;