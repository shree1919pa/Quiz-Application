import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const decodeToken = (token) => {
  try {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[Auth] Invalid token format - expected 3 parts, got', parts.length)
      return null
    }
    const payload = JSON.parse(atob(parts[1]))
    console.log('[Auth] Token decoded:', { id: payload.id, role: payload.role, name: payload.name })
    return payload
  } catch (error) {
    console.error('[Auth] Error decoding token:', error.message)
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    
    if (storedToken) {
      const payload = decodeToken(storedToken)
      if (payload) {
        console.log('[Auth] Initializing from localStorage:', { role: payload.role })
        setToken(storedToken)
        setRole(payload.role || storedRole)
        setUser(payload)
      } else {
        console.warn('[Auth] Stored token is invalid, clearing')
        localStorage.removeItem('token')
        localStorage.removeItem('role')
      }
    }
    setIsInitialized(true)
  }, [])

  // Update user when token changes
  useEffect(() => {
    if (token) {
      const payload = decodeToken(token)
      if (payload) {
        setUser(payload)
        setRole(payload.role)
      }
    } else {
      setUser(null)
      setRole(null)
    }
  }, [token])

  const login = (newToken, newRole) => {
    console.log('[Auth] Login called with role:', newRole)
    const payload = decodeToken(newToken)
    if (!payload) {
      console.error('[Auth] Login failed - token is invalid')
      return
    }
    const finalRole = payload?.role || newRole
    console.log('[Auth] Final role from token:', finalRole)
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', finalRole)
    setToken(newToken)
    setRole(finalRole)
  }

  const logout = () => {
    console.log('[Auth] Logout called')
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    setToken(null)
    setRole(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ 
        token, 
        role, 
        user, 
        login, 
        logout, 
        isAuthenticated: Boolean(token && role),
        isInitialized
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
