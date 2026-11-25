import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api, TOKEN_KEY } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY))

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  // Restore session on first load
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return
    api.get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => clear())
      .finally(() => setLoading(false))
  }, [clear])

  // Token expired / rejected by the API
  useEffect(() => {
    const onUnauthorized = () => {
      clear()
      toast.error('Your session has expired. Please sign in again.')
    }
    window.addEventListener('sole:unauthorized', onUnauthorized)
    return () => window.removeEventListener('sole:unauthorized', onUnauthorized)
  }, [clear])

  const persist = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (email, password) => persist(await api.post('/auth/login', { email, password }))
  const register = async (name, email, password) => persist(await api.post('/auth/register', { name, email, password }))
  const logout = () => {
    clear()
    toast.success('Signed out')
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
