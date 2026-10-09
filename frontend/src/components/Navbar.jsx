import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth()

  return (
    <header className="site-navbar">
      <div className="brand">
        <img src="/logo.svg" alt="Online Quiz Logo" className="brand-logo" />
        <div>
          <h1>Online Quiz Application</h1>
          <p>Modern quiz management for examiners and aspirants</p>
        </div>
      </div>

      <nav className="nav-links">
        {!isAuthenticated && (
          <>
            <Link to="/">Login</Link>
            <Link to="/register-examiner">Examiner Signup</Link>
            <Link to="/register-aspirant">Aspirant Signup</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <Link to={role === 'admin' ? '/admin/dashboard' : role === 'examiner' ? '/examiner' : '/aspirant'}>
              {role === 'admin' ? '🛡️ Admin Dashboard' : 'Dashboard'}
            </Link>
            <button onClick={logout} className="link-button">Logout</button>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
