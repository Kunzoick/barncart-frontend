import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let authRefreshFn = null

export function setRefreshFn(fn) {
  authRefreshFn = fn
}

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = window.__accessToken__
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 — attempt silent refresh then retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    //skip retry for auth endpoints
    const isAuthEndpoint = original.url?.includes('/api/auth/')
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true
      if (authRefreshFn) {
        const newToken = await authRefreshFn()
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api