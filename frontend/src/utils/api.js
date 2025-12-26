import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Add interceptor to include token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Claims API
export const claimsAPI = {
  uploadCSV: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    // Don't set Content-Type - axios will set it automatically with boundary
    // This preserves the Authorization header from axios defaults
    return api.post('/claims/upload', formData)
  },

  getClaims: () => api.get('/claims'),

  getStats: () => api.get('/claims/stats'),

  updateStatus: (id, status) => api.patch(`/claims/${id}/status`, { status }),

  deleteClaim: (id) => api.delete(`/claims/${id}`)
}

export default api
