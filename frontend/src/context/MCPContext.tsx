import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeASEMCP, cleanupASEMCP, isMCPActive, testMCPConnection } from '../mcp/aseAnalyticsMcp';

interface MCPContextType {
  mcpActivo: boolean;
  mcpError: string | null;
  conectarMCP: () => Promise<boolean>;
  desconectarMCP: () => void;
  testConnection: () => Promise<boolean>;
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

  const testConnection = async (): Promise<boolean> => {
    try {
      const isReallyConnected = await testMCPConnection();
      setMcpActivo(isReallyConnected);
      if (!isReallyConnected) {
        setMcpError("Extensión MCP-B no responde");
      } else {
        setMcpError(null);
      }
      return isReallyConnected;
    } catch (error: any) {
      console.error("❌ Error testando conexión:", error);
      setMcpError("Error verificando extensión");
      return false;
    }
  };

  // Verificar estado MCP solo ocasionalmente
  useEffect(() => {
    const intervalo = setInterval(() => {
      const estadoActual = isMCPActive();
      
      // Solo actualizar si hay un cambio real
      if (estadoActual !== mcpActivo) {
        console.log("🔍 Estado MCP cambió:", { actual: estadoActual, previo: mcpActivo });
        setMcpActivo(estadoActual);
        
        // No cambiar el error automáticamente - dejarlo para manejo manual
      }
    }, 5000); // Verificar cada 5 segundos, menos frecuente

    return () => clearInterval(intervalo);
  }, [mcpActivo]);

  // Listener para eventos de estado MCP
  useEffect(() => {
    const handleMCPStateChange = (event: CustomEvent) => {
      const { loading, error } = event.detail;
      if (loading !== undefined) setLoading(loading);
      if (error !== undefined) setMcpError(error);
    };

    window.addEventListener('mcpStateChange', handleMCPStateChange as EventListener);

    return () => {
      window.removeEventListener('mcpStateChange', handleMCPStateChange as EventListener);
    };
  }, []);

  return (
    <MCPContext.Provider value={{
      mcpActivo,
      mcpError,
      conectarMCP,
      desconectarMCP,
      testConnection,
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