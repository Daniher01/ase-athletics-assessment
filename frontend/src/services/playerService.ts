import api from './api'

export const playerService = {
  getPlayers: async (page = 1, limit = 10) => {
    const response = await api.get(`/players?page=${page}&limit=${limit}`)
    return response.data
  },
  
  getPlayerById: async (id: number) => {
    const response = await api.get(`/players/${id}`)
    return response.data
  }
}