import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminSidebar = ({ pendingApprovalsCount = 0 }) => {
  const { logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { 
      label: 'Examiner Approvals', 
      path: '/admin/examiner-approvals', 
      icon: '⏳',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
    },
    { label: 'All Users', path: '/admin/users', icon: '👥' },
    { label: 'All Examiners', path: '/admin/examiners', icon: '👨‍🏫' },
    { label: 'All Aspirants', path: '/admin/aspirants', icon: '🎓' },
    { label: 'Community Management', path: '/admin/communities', icon: '🏛️' },
    { label: 'Quiz Management', path: '/admin/quizzes', icon: '📝' },
    { label: 'Reports & Analytics', path: '/admin/analytics', icon: '📈' },
    { label: 'My Profile', path: '/admin/profile', icon: '👤' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-icon">🛡️</div>
        <div className="admin-brand-text">
          <h2>Admin Center</h2>
          <span>System Control</span>
        </div>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
            {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={logout} className="admin-logout-btn">
          <span>🚪</span>
          <span>Sign Out Admin</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
