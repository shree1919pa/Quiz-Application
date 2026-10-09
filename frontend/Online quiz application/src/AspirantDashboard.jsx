import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AspirantDashboard = () => {
  const [name, setName] = useState('Aspirant')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!token || role !== 'aspirant') {
      navigate('/')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setName(payload.fullName || payload.name || 'Aspirant')
    } catch {
      setName('Aspirant')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/')
  }

  return (
    <div className="page-shell dashboard-shell">
      <aside className="sidebar-panel">
        <div className="brand-card">
          <span className="brand-icon">AS</span>
          <div>
            <p className="eyebrow">Aspirant Dashboard</p>
            <h2>{name}</h2>
          </div>
        </div>
        <nav className="nav-list">
          <button className="nav-item">Available Quizzes</button>
          <button className="nav-item">Quiz History</button>
          <button className="nav-item">Results</button>
          <button className="nav-item nav-logout" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">Welcome back</span>
            <h1>Welcome, {name}</h1>
            <p>Access your available quizzes, history and results.</p>
          </div>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>

        <div className="cards-grid">
          <div className="control-card">
            <h3>Available Quizzes</h3>
            <p>Browse the latest quizzes open for registration and start them immediately.</p>
            <button className="btn btn-outline">Browse</button>
          </div>
          <div className="control-card">
            <h3>Quiz History</h3>
            <p>Review your past quiz attempts and see how you performed.</p>
            <button className="btn btn-outline">View</button>
          </div>
          <div className="control-card">
            <h3>Results</h3>
            <p>Check detailed scores, feedback and percentile rankings.</p>
            <button className="btn btn-outline">Open</button>
          </div>
          <div className="control-card">
            <h3>Support</h3>
            <p>Need help? Reach out to your examiner or platform support team.</p>
            <button className="btn btn-outline">Contact</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AspirantDashboard
