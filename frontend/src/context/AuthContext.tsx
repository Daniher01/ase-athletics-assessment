import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AuthContextType, User } from '../types'
import { authService } from '../services/authService'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Verificar token al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      // Aquí se hace la llamada para verificar el token
      // Simulacion de llamada al servicio de autenticación
      setUser({ id: 1, email: 'demo@example.com', name: 'Demo User' })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authService.login(email, password)
      
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('token', response.token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      const response = await authService.register(email, password, name)
      
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('token', response.token)
    } catch (error) {
      console.error('Register failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    authService.logout()
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}