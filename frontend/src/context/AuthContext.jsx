import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

/**
 * Bulletproof JWT decoder:
 * - Handles base64url padding (- and _)
 * - Decodes UTF-8 multi-byte characters safely
 */
const decodeToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[Auth] Invalid token format - expected 3 parts, got', parts.length)
      return null
    }

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decodedText = new TextDecoder('utf-8').decode(bytes)
    const payload = JSON.parse(decodedText)
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
    const storedUser = localStorage.getItem('user')
    
    if (storedToken) {
      const payload = decodeToken(storedToken)
      let parsedUser = null
      if (storedUser) {
        try { parsedUser = JSON.parse(storedUser) } catch (_) {}
      }

      const finalRole = (payload?.role || storedRole || parsedUser?.role || '').toLowerCase()
      if (storedToken && finalRole) {
        setToken(storedToken)
        setRole(finalRole)
        setUser(parsedUser || payload || { role: finalRole })
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('user')
      }
    }
    setIsInitialized(true)
  }, [])

  // Synchronize user profile when token changes
  useEffect(() => {
    if (token) {
      const payload = decodeToken(token)
      if (payload) {
        setUser(prev => prev || payload)
        setRole(prev => prev || payload.role)
      }
    } else {
      setUser(null)
      setRole(null)
    }
  }, [token])

  const login = (newToken, newRole, userData = null) => {
    console.log('[Auth] Login called with role:', newRole)
    const payload = decodeToken(newToken)
    const finalRole = (payload?.role || newRole || userData?.role || '').toLowerCase()
    const finalUser = userData || payload || { id: payload?.id, role: finalRole }
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', finalRole)
    if (finalUser) {
      localStorage.setItem('user', JSON.stringify(finalUser))
    }
    setToken(newToken)
    setRole(finalRole)
    setUser(finalUser)
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
