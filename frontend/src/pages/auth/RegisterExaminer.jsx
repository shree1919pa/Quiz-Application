import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../services/api.js'

const RegisterExaminer = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
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
      const data = await apiFetch('/auth/register/examiner', {
        method: 'POST',
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      })

      setSuccess(data.message || 'Examiner registration submitted. Awaiting admin approval.')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.message || 'Registration failed.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page centered-page">
      <section className="auth-card large-card">
        <span className="eyebrow">Examiner Registration</span>
        <h1>Register as an Examiner</h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
          <label>
            Full Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Registering...' : 'Register Examiner'}
          </button>
        </form>

        <div className="form-footnote">
          <span>Already have an account?</span>
          <Link to="/">Back to Login</Link>
        </div>
      </section>
    </main>
  )
}

export default RegisterExaminer
