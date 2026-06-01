import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api, { setRefreshFn } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const login = useCallback((data) => {
    setAccessToken(data.accessToken)
    window.__accessToken__ = data.accessToken
    setUser({ email: data.email, role: data.role, firstName: data.firstName })
    // No localStorage — refresh token is now in httpOnly cookie
  }, [])

  const logout = useCallback(async () => {
    try {
      // POST to logout — browser sends the httpOnly cookie automatically
      await api.post('/api/auth/logout')
    } catch (_) {}
    setAccessToken(null)
    window.__accessToken__ = null
    setUser(null)
    // No localStorage to clear
  }, [])

  const refresh = useCallback(async () => {
    try {
      // No body needed — browser sends httpOnly cookie automatically
      const res = await api.post('/api/auth/refresh')
      setAccessToken(res.data.accessToken)
      window.__accessToken__ = res.data.accessToken
      setUser({ email: res.data.email, role: res.data.role, firstName: res.data.firstName })
      return res.data.accessToken
    } catch (_) {
      setAccessToken(null)
      window.__accessToken__ = null
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    setRefreshFn(refresh)
  }, [refresh])

  // Attempt silent refresh on page load
  // Cookie is sent automatically — no localStorage check needed
  useEffect(() => {
    refresh().finally(() => setAuthLoading(false))
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refresh, authLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}