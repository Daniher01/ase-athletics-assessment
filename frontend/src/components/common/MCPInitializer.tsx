import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMCP } from '../../context/MCPContext';

const MCPInitializer: React.FC = () => {
  const { user } = useAuth();
  const { mcpActivo, conectarMCP } = useMCP();
  const navigate = useNavigate();
  const hasInitialized = useRef(false); // Para evitar múltiples inicializaciones

  useEffect(() => {
    // Solo inicializar MCP una vez cuando el usuario está autenticado
    if (user && !hasInitialized.current) {
      console.log("👤 Usuario autenticado detectado, inicializando MCP una sola vez...");
      hasInitialized.current = true;
      
      // Delay pequeño para asegurar que la UI esté lista
      const timer = setTimeout(() => {
        conectarMCP();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, conectarMCP]);

  useEffect(() => {
    // Listener para navegación MCP
    const handleMCPNavigation = (event: CustomEvent) => {
      const { path } = event.detail;
      console.log("🧭 Navegación MCP solicitada a:", path);
      navigate(path);
    };

    window.addEventListener('mcpNavigate', handleMCPNavigation as EventListener);

    return () => {
      window.removeEventListener('mcpNavigate', handleMCPNavigation as EventListener);
    };
  }, [navigate]);

  // Este componente no renderiza nada, solo maneja la lógica
  return null;
};

export default MCPInitializer;