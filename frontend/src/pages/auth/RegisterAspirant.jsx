import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { API_BASE_URL } from '../../services/api.js'

const RegisterAspirant = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/aspirant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Registration failed.')
        return
      }

      setSuccess('Account created! Redirecting to select your interests...')

      if (data.token) {
        login(data.token, 'aspirant')
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        setTimeout(() => navigate('/aspirant/select-interests'), 900)
      } else {
        setTimeout(() => navigate('/'), 1200)
      }
    } catch (err) {
      setError('Unable to connect to the server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page centered-page">
      <section className="auth-card large-card">
        <span className="eyebrow">Aspirant Registration</span>
        <h1>Register as an Aspirant</h1>
        <label>
          Full Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
        </label>
        <label>
          Email address
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        <label>
          Confirm Password
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
        </label>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Registering...' : 'Register Aspirant'}
        </button>

        <div className="form-footnote">
          <span>Already have an account?</span>
          <Link to="/">Back to Login</Link>
        </div>
      </section>
    </main>
  )
}

export default RegisterAspirant
