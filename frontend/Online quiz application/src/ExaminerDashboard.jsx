import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ExaminerDashboard = () => {
  const [name, setName] = useState('Examiner')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!token || role !== 'examiner') {
      navigate('/')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setName(payload.fullName || payload.name || 'Examiner')
    } catch {
      setName('Examiner')
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
          <span className="brand-icon">EX</span>
          <div>
            <p className="eyebrow">Examiner Dashboard</p>
            <h2>{name}</h2>
          </div>
        </div>
        <nav className="nav-list">
          <button className="nav-item">Create Quiz</button>
          <button className="nav-item">Manage Questions</button>
          <button className="nav-item">View Results</button>
          <button className="nav-item nav-logout" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">Welcome back</span>
            <h1>Welcome, {name}</h1>
            <p>Manage quizzes, questions, and review results from one place.</p>
          </div>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>

        <div className="cards-grid">
          <div className="control-card">
            <h3>Create Quiz</h3>
            <p>Create a new quiz and configure questions, duration, and rules.</p>
            <button className="btn btn-outline">Open</button>
          </div>
          <div className="control-card">
            <h3>Manage Questions</h3>
            <p>Edit, add or remove questions across your active quizzes.</p>
            <button className="btn btn-outline">Manage</button>
          </div>
          <div className="control-card">
            <h3>View Results</h3>
            <p>See aspirant performance and quiz analytics at a glance.</p>
            <button className="btn btn-outline">View</button>
          </div>
          <div className="control-card">
            <h3>Profile</h3>
            <p>Update your examiner settings and contact information.</p>
            <button className="btn btn-outline">Open</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ExaminerDashboard
