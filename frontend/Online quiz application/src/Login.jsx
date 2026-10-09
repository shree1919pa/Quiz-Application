import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('examiner')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (loginRole) => {
    setError('')
    if (!email.trim() || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/auth/login/${loginRole}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('role', loginRole)
      navigate(loginRole === 'examiner' ? '/examiner' : '/aspirant')
    } catch (err) {
      console.error(err)
      setError('Unable to connect to the server. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="hero-panel">
        <div>
          <span className="eyebrow">Online Quiz Application</span>
          <h1>Sign in to continue</h1>
          <p>Choose your role and access the quiz portal securely.</p>
        </div>
        <div className="login-hero-card">
          <span>Login quickly as:</span>
          <div className="role-buttons">
            <button
              type="button"
              className={role === 'examiner' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setRole('examiner')}
            >
              Examiner
            </button>
            <button
              type="button"
              className={role === 'aspirant' ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setRole('aspirant')}
            >
              Aspirant
            </button>
          </div>
          <div className="action-buttons">
            <button
              className="btn btn-primary btn-block"
              onClick={() => handleLogin(role)}
              disabled={loading}
            >
              Login as {role === 'examiner' ? 'Examiner' : 'Aspirant'}
            </button>
          </div>
        </div>
      </div>

      <div className="form-panel">
        <div className="form-card">
          <h2>Login</h2>
          <p className="form-copy">Use your email and password to access the portal.</p>
          <label>
            Name or Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button
              className="btn btn-primary btn-block"
              onClick={() => handleLogin(role)}
              disabled={loading}
            >
              {loading ? 'Signing in...' : `Continue as ${role === 'examiner' ? 'Examiner' : 'Aspirant'}`}
            </button>
          </div>

          <div className="split-action">
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={() => setRole('examiner')}
            >
              Login as Examiner
            </button>
            <button
              type="button"
              className="btn btn-outline btn-block"
              onClick={() => setRole('aspirant')}
            >
              Login as Aspirant
            </button>
          </div>

          <div className="create-links">
            <Link to="/register-examiner" className="link-button">Create Examiner Account</Link>
            <Link to="/register-aspirant" className="link-button">Create Aspirant Account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
