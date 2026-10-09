import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const UserManagement = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Modal State for Block/Unblock
  const [blockModal, setBlockModal] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        role: roleFilter,
        status: statusFilter,
        search: search.trim()
      });
      const data = await apiFetch(`/admin/users?${queryParams.toString()}`);
      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleBlockConfirm = async () => {
    if (!blockModal) return;
    const { userId, newBlockedState } = blockModal;

    setActionLoading(userId);
    try {
      await apiFetch(`/admin/users/${userId}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ isBlocked: newBlockedState })
      });
      setBlockModal(null);
      fetchUsers();
    } catch (err) {
      alert(`Error updating block status: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout
      title="User Management"
      subtitle="Control platform access, verify accounts, and manage examiner/aspirant privileges"
    >
      {error && <div className="error-message">{error}</div>}

      <section className="admin-card">
        {/* Filter Controls */}
        <div className="admin-filters">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                All Roles
              </button>
              <button
                className={`admin-tab-btn ${roleFilter === 'examiner' ? 'active' : ''}`}
                onClick={() => setRoleFilter('examiner')}
              >
                👨‍🏫 Examiners
              </button>
              <button
                className={`admin-tab-btn ${roleFilter === 'aspirant' ? 'active' : ''}`}
                onClick={() => setRoleFilter('aspirant')}
              >
                🎓 Aspirants
              </button>
            </div>

            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="blocked">Blocked Accounts</option>
              <option value="pending">Pending Approvals</option>
              <option value="rejected">Rejected Examiners</option>
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="admin-empty-state">
            <h4>Loading users...</h4>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">👥</div>
            <h4>No Users Found</h4>
            <p>No user accounts matched your search or filter criteria.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Account Status</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === 'examiner'
                            ? 'badge-examiner'
                            : user.role === 'aspirant'
                            ? 'badge-aspirant'
                            : 'badge-admin'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${user.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {user.role === 'examiner' ? (
                        <span
                          className={`badge ${
                            user.approvalStatus === 'approved'
                              ? 'badge-approved'
                              : user.approvalStatus === 'rejected'
                              ? 'badge-rejected'
                              : 'badge-pending'
                          }`}
                        >
                          {user.approvalStatus}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {user.role !== 'admin' && (
                          <button
                            className={`btn-xs ${user.isBlocked ? 'btn-xs-success' : 'btn-xs-danger'}`}
                            onClick={() =>
                              setBlockModal({
                                userId: user._id,
                                userName: user.name,
                                userRole: user.role,
                                currentBlocked: user.isBlocked,
                                newBlockedState: !user.isBlocked
                              })
                            }
                          >
                            {user.isBlocked ? '✓ Unblock' : '🚫 Block'}
                          </button>
                        )}

                        {user.role === 'examiner' && (
                          <Link to={`/admin/examiners/${user._id}`} className="btn-xs btn-xs-outline">
                            Profile
                          </Link>
                        )}

                        {user.role === 'aspirant' && (
                          <Link to={`/admin/aspirants/${user._id}`} className="btn-xs btn-xs-outline">
                            History
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Block/Unblock Modal */}
      {blockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {blockModal.newBlockedState ? '🚫 Block User Account' : '✓ Unblock User Account'}
              </h3>
              <button className="modal-close-btn" onClick={() => setBlockModal(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to{' '}
                <strong>{blockModal.newBlockedState ? 'BLOCK' : 'UNBLOCK'}</strong>{' '}
                {blockModal.userRole} <strong>"{blockModal.userName}"</strong>?
              </p>
              {blockModal.newBlockedState ? (
                <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                  When blocked, this user will be immediately rejected from logging in and accessing any
                  protected APIs or exams. Their historical records and quiz data will remain preserved.
                </p>
              ) : (
                <p style={{ color: '#059669', fontSize: '0.9rem' }}>
                  When unblocked, this user will regain full access in accordance with their role and
                  approval standing.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setBlockModal(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={
                  blockModal.newBlockedState
                    ? { background: '#ef4444', color: '#ffffff', border: 'none' }
                    : { background: '#10b981', color: '#ffffff', border: 'none' }
                }
                disabled={actionLoading !== null}
                onClick={handleBlockConfirm}
              >
                {actionLoading ? 'Updating...' : `Confirm ${blockModal.newBlockedState ? 'Block' : 'Unblock'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
