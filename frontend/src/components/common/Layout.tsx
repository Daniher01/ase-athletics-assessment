import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMCP } from '../../context/MCPContext'
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  BarChart3, 
  FileText, 
  Settings,
  LogOut,
  Bot,
  ChevronRight
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // móvil
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // desktop
  const { user, logout } = useAuth()
  const { mcpActivo, conectarMCP } = useMCP()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }


  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Jugadores', href: '/players', icon: Users },
    { name: 'Comparación', href: '/comparison', icon: BarChart3 },
    { name: 'Reportes', href: '/reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        <div className="flex flex-col flex-grow pt-5 bg-secondary-800 overflow-y-auto">
          {/* Logo y Toggle */}
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="bg-primary-600 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">ASE</span>
              </div>
              {!isSidebarCollapsed && (
                <span className="ml-3 text-white text-xl font-semibold">Athletics</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="text-secondary-300 hover:text-white p-2 rounded-md transition-colors"
                title="Contraer menú"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Botón expandir cuando está colapsado */}
          {isSidebarCollapsed && (
            <div className="px-2 pb-4">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-full flex justify-center items-center py-3 text-secondary-300 hover:text-white hover:bg-secondary-700 rounded-md transition-colors"
                title="Expandir menú"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Estado MCP Global */}
          <div className="px-4 py-2">
            {isSidebarCollapsed ? (
              <div className="flex justify-center">
                <div 
                  className={`w-3 h-3 rounded-full ${mcpActivo ? 'bg-green-400' : 'bg-yellow-400'}`}
                  title={mcpActivo ? 'IA Activa' : 'IA Conectando...'}
                ></div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${mcpActivo ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-secondary-300">
                  {mcpActivo ? '🤖 IA Activa' : '🤖 IA Conectando...'}
                </span>
                {!mcpActivo && (
                  <button 
                    onClick={conectarMCP}
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    Conectar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-secondary-700 text-white'
                      : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
                  } ${isSidebarCollapsed ? 'px-3 justify-center' : 'px-2'}`}
                  title={isSidebarCollapsed ? item.name : ''}
                >
                  <item.icon className={`h-5 w-5 ${!isSidebarCollapsed ? 'mr-3' : ''}`} />
                  {!isSidebarCollapsed && item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 flex border-t border-secondary-700 p-4">
            {isSidebarCollapsed ? (
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="bg-primary-600 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {user?.name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="absolute -bottom-1 -right-1 bg-secondary-600 hover:bg-secondary-500 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-3 w-3 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="bg-primary-600 w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs text-secondary-300 hover:text-white transition-colors"
                  >
                    <LogOut className="mr-1 h-3 w-3" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      {isSidebarOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="bg-primary-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">ASE</span>
                  </div>
                  <span className="ml-3 text-white text-xl font-semibold">Athletics</span>
                </div>
                
                <nav className="mt-8 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-secondary-700 text-white'
                            : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
      }`}>
        {/* Top bar mobile */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}