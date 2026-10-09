import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Sidebar = ({ links }) => {
  const { role } = useAuth()

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <span>{role === 'examiner' ? 'Examiner' : 'Aspirant'}</span>
      </div>
      <nav className="sidebar-nav">
        {links.map((item) => (
          <Link key={item.label} to={item.path} className="sidebar-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
