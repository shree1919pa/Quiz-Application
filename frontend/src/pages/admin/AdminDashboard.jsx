import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/admin/stats');
      if (data?.success) {
        setStats(data.stats);
        setRecentPending(data.recentPendingExaminers || []);
        setRecentAttempts(data.recentAttempts || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprovalAction = async (examinerId, status, examinerName) => {
    const actionWord = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionWord} examiner "${examinerName}"?`)) {
      return;
    }

    setActionLoading(examinerId);
    try {
      await apiFetch(`/admin/examiners/${examinerId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      // Refresh stats and pending list
      fetchStats();
    } catch (err) {
      alert(`Error updating approval: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Comprehensive system oversight and platform management"
      actions={
        <button
          className="btn btn-outline"
          onClick={fetchStats}
          disabled={loading}
          style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      }
    >
      {error && <div className="error-message">{error}</div>}

      {/* Live Statistics Cards */}
      <section className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Examiners</span>
            <div className="stat-card-icon">👨‍🏫</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.totalExaminers ?? 0}</div>
          <div className="stat-card-footer">
            <span>Registered educator accounts</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-card-header">
            <span className="stat-card-label">Pending Approvals</span>
            <div className="stat-card-icon">⏳</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.pendingExaminerApprovals ?? 0}</div>
          <div className="stat-card-footer">
            <Link to="/admin/examiner-approvals" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
              Requires review →
            </Link>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-card-header">
            <span className="stat-card-label">Approved Examiners</span>
            <div className="stat-card-icon">✅</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.approvedExaminers ?? 0}</div>
          <div className="stat-card-footer">
            <span>Active quiz creators</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Aspirants</span>
            <div className="stat-card-icon">🎓</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.totalAspirants ?? 0}</div>
          <div className="stat-card-footer">
            <span>Registered quiz takers</span>
          </div>
        </div>

        <div className="stat-card stat-danger">
          <div className="stat-card-header">
            <span className="stat-card-label">Blocked Users</span>
            <div className="stat-card-icon">🚫</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.blockedUsers ?? 0}</div>
          <div className="stat-card-footer">
            <Link to="/admin/users?status=blocked" style={{ color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>
              View restricted accounts →
            </Link>
          </div>
        </div>

        <div className="stat-card stat-teal">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Quizzes</span>
            <div className="stat-card-icon">📝</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.totalQuizzes ?? 0}</div>
          <div className="stat-card-footer">
            <span>Published & drafts</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-card-header">
            <span className="stat-card-label">Published Quizzes</span>
            <div className="stat-card-icon">🌐</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.publishedQuizzes ?? 0}</div>
          <div className="stat-card-footer">
            <span>Live on the platform</span>
          </div>
        </div>

        <div className="stat-card stat-primary">
          <div className="stat-card-header">
            <span className="stat-card-label">Quiz Attempts</span>
            <div className="stat-card-icon">📊</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.totalQuizAttempts ?? 0}</div>
          <div className="stat-card-footer">
            <span>Total examination submissions</span>
          </div>
        </div>
      </section>

      {/* Pending Approvals Quick Panel */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Pending Examiner Approvals</h3>
            <p>Review new examiner registrations awaiting administrator authorization</p>
          </div>
          <Link to="/admin/examiner-approvals" className="btn-xs btn-xs-primary">
            View All Approvals ({stats?.pendingExaminerApprovals || 0}) →
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🎉</div>
            <h4>No Pending Examiner Approvals</h4>
            <p>All examiner registration requests have been reviewed.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Examiner Name</th>
                  <th>Email</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPending.map((examiner) => (
                  <tr key={examiner._id}>
                    <td style={{ fontWeight: 600 }}>{examiner.name}</td>
                    <td>{examiner.email}</td>
                    <td>{new Date(examiner.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-pending">Pending</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-xs btn-xs-success"
                          disabled={actionLoading === examiner._id}
                          onClick={() => handleApprovalAction(examiner._id, 'approved', examiner.name)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn-xs btn-xs-danger"
                          disabled={actionLoading === examiner._id}
                          onClick={() => handleApprovalAction(examiner._id, 'rejected', examiner.name)}
                        >
                          ✕ Reject
                        </button>
                        <Link to={`/admin/examiners/${examiner._id}`} className="btn-xs btn-xs-outline">
                          Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Platform Attempts */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Recent Quiz Submissions</h3>
            <p>Live feed of student examination activity across the platform</p>
          </div>
          <Link to="/admin/quizzes" className="btn-xs btn-xs-outline">
            Browse All Quizzes →
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📝</div>
            <h4>No Attempts Recorded Yet</h4>
            <p>Student quiz attempts will appear here once submitted.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Category</th>
                  <th>Aspirant</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt._id}>
                    <td style={{ fontWeight: 600 }}>{attempt.quizId?.title || 'Untitled Quiz'}</td>
                    <td>
                      <span className="badge badge-community">
                        {attempt.quizId?.category || 'General'}
                      </span>
                    </td>
                    <td>{attempt.aspirantId?.name || 'Aspirant'} ({attempt.aspirantId?.email})</td>
                    <td style={{ fontWeight: 700 }}>
                      {attempt.score} / {attempt.totalMarks}
                    </td>
                    <td>
                      <span className={`badge ${attempt.percentage >= 40 ? 'badge-pass' : 'badge-fail'}`}>
                        {attempt.percentage.toFixed(1)}% {attempt.percentage >= 40 ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td>{new Date(attempt.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
