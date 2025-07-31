import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMCP } from '../../context/MCPContext';

const MCPInitializer: React.FC = () => {
  const { user } = useAuth();
  const { mcpActivo, conectarMCP } = useMCP();

  useEffect(() => {
    // Solo inicializar MCP si el usuario está autenticado y MCP no está activo
    if (user && !mcpActivo) {
      console.log("👤 Usuario autenticado detectado, inicializando MCP...");
      
      // Delay pequeño para asegurar que la UI esté lista
      const timer = setTimeout(() => {
        conectarMCP();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, mcpActivo, conectarMCP]);

  // Este componente no renderiza nada, solo maneja la lógica
  return null;
};

export default MCPInitializer;