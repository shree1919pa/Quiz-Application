import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { apiFetch } from '../../services/api';

const AdminLayout = ({ children, title, subtitle, actions }) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const data = await apiFetch('/admin/stats');
        if (data?.stats?.pendingExaminerApprovals !== undefined) {
          setPendingCount(data.stats.pendingExaminerApprovals);
        }
      } catch (err) {
        // Silently catch layout background stat polling
      }
    };

    fetchPendingCount();
  }, []);

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <AdminSidebar pendingApprovalsCount={pendingCount} />
        
        <main className="admin-main">
          {(title || subtitle || actions) && (
            <header className="admin-header">
              <div className="admin-header-title">
                {title && <h1>{title}</h1>}
                {subtitle && <p>{subtitle}</p>}
              </div>
              {actions && <div className="admin-header-actions">{actions}</div>}
            </header>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
