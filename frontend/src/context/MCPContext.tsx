import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeASEMCP, cleanupASEMCP, isMCPActive } from '../mcp/aseAnalyticsMcp';

interface MCPContextType {
  mcpActivo: boolean;
  mcpError: string | null;
  conectarMCP: () => Promise<boolean>;
  desconectarMCP: () => void;
  loading: boolean;
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

interface MCPProviderProps {
  children: ReactNode;
}

export const MCPProvider: React.FC<MCPProviderProps> = ({ children }) => {
  const [mcpActivo, setMcpActivo] = useState(() => isMCPActive());
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const conectarMCP = async (): Promise<boolean> => {
    if (mcpActivo) {
      console.log("⚠️ MCP ya está conectado");
      return true;
    }

    setLoading(true);
    setMcpError(null);
    
    try {
      console.log("🚀 Conectando MCP globalmente...");
      const conectado = await initializeASEMCP();
      setMcpActivo(conectado);
      
      if (!conectado) {
        setMcpError("No se pudo conectar con la extensión MCP-B");
      }
      
      return conectado;
    } catch (error: any) {
      console.error("❌ Error conectando MCP:", error);
      setMcpError(`Error de conexión: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const desconectarMCP = () => {
    try {
      cleanupASEMCP();
      setMcpActivo(false);
      setMcpError(null);
      console.log("🔌 MCP desconectado globalmente");
    } catch (error: any) {
      console.error("❌ Error desconectando MCP:", error);
    }
  };

  // Verificar estado MCP periódicamente
  useEffect(() => {
    const intervalo = setInterval(async () => {
      const estadoActual = isMCPActive();
      console.log("🔍 Verificando estado MCP:", { actual: estadoActual, previo: mcpActivo });
      
      if (estadoActual !== mcpActivo) {
        setMcpActivo(estadoActual);
        if (!estadoActual && mcpActivo) {
          console.warn("⚠️ Conexión MCP perdida, intentando reconectar...");
          setMcpError("Conexión MCP perdida - intentando reconectar...");
          
          // Intentar reconectar automáticamente
          setTimeout(async () => {
            try {
              const reconectado = await conectarMCP();
              if (reconectado) {
                console.log("✅ Reconexión MCP exitosa");
                setMcpError(null);
              } else {
                console.error("❌ Falló la reconexión MCP");
                setMcpError("No se pudo reconectar automáticamente");
              }
            } catch (error) {
              console.error("❌ Error en reconexión automática:", error);
              setMcpError("Error en reconexión automática");
            }
          }, 2000);
        }
      }
    }, 3000); // Verificar cada 3 segundos (más frecuente)

    return () => clearInterval(intervalo);
  }, [mcpActivo, conectarMCP]);

  return (
    <MCPContext.Provider value={{
      mcpActivo,
      mcpError,
      conectarMCP,
      desconectarMCP,
      loading
    }}>
      {children}
    </MCPContext.Provider>
  );
};

export const useMCP = (): MCPContextType => {
  const context = useContext(MCPContext);
  if (context === undefined) {
    throw new Error('useMCP debe ser usado dentro de un MCPProvider');
  }
  return context;
};