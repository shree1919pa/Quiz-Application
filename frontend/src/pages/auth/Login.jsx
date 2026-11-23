import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiFetch } from '../../services/api.js'

const Login = () => {
  const [role, setRole] = useState('examiner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Ensure fields always start empty when page mounts
  useEffect(() => {
    setEmail('')
    setPassword('')
    setError('')
  }, [])

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      console.log('[Login] Attempting login for role:', role, 'with email:', cleanEmail)
      const data = await apiFetch(`/auth/login/${role}`, {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      })

      if (!data || !data.token) {
        throw new Error(data?.message || 'Login failed. No authentication token received.')
      }

      console.log('[Login] Login successful, token received:', {
        role: role,
        user: data.user?.name
      })
      
      login(data.token, role, data.user)

      if (role === 'examiner') {
        navigate('/examiner')
      } else {
        // If student has no interests yet, redirect to select interests
        const hasInterests = data.user?.interests && Array.isArray(data.user.interests) && data.user.interests.length > 0
        if (!hasInterests) {
          navigate('/aspirant/select-interests')
        } else {
          navigate('/aspirant')
        }
      }
    } catch (err) {
      console.error('[Login] Error:', err)
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div>
          <span className="eyebrow">Online Quiz Application</span>
          <h1>Welcome back</h1>
          <p>Login as an examiner or aspirant to continue.</p>
        </div>
        <div className="role-switch">
          <button
            type="button"
            className={role === 'examiner' ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => handleRoleChange('examiner')}
          >
            Examiner Login
          </button>
          <button
            type="button"
            className={role === 'aspirant' ? 'btn btn-primary' : 'btn btn-outline'}
            onClick={() => handleRoleChange('aspirant')}
          >
            Aspirant Login
          </button>
        </div>
      </section>

      <section className="auth-card">
        <h2>{role === 'examiner' ? 'Examiner Login' : 'Aspirant Login'}</h2>
        <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'grid', gap: '18px' }}>
          <label>
            Email address
            <input
              type="email"
              name="email"
              id="user_email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              id="user_password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-grid">
          <Link className="link-button" to="/register-examiner">Create Examiner Account</Link>
          <Link className="link-button" to="/register-aspirant">Create Aspirant Account</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '12px', borderTop: '1px solid rgba(20, 38, 81, 0.08)', paddingTop: '14px' }}>
          <Link to="/admin/login" className="admin-login-link-corner">
            🔒 Admin Login
          </Link>
        </div>
      </section>
    </main>
  )
}

export default Login
