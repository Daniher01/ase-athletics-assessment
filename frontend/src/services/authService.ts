import api from './api'

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name })
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('token')
  }
}