import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const RegisterExaminer = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/register/examiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim(), email: email.trim(), password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      setSuccess('Registration successful. Redirecting to login...')
      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      console.error(err)
      setError('Unable to connect to the server. Please try later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell centered-page">
      <div className="form-card large-card">
        <span className="eyebrow">Examiner Registration</span>
        <h1>Create your examiner account</h1>
        <p className="form-copy">Fill in your details to manage exams and quizzes.</p>

        <label>
          Full Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </label>
        <label>
          Email address
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
        </label>
        <label>
          Confirm Password
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" />
        </label>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Registering...' : 'Register Examiner'}
        </button>

        <div className="form-footnote">
          <span>Already have an account?</span>
          <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterExaminer
