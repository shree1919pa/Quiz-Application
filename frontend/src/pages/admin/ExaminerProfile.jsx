import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const ExaminerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExaminerDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/admin/examiners/${id}`);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load examiner details:', err);
      setError(err.message || 'Failed to fetch examiner profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchExaminerDetails();
  }, [id]);

  const handleApprovalChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to set approval status to "${newStatus}"?`)) return;
    setActionLoading(true);
    try {
      await apiFetch(`/admin/examiners/${id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchExaminerDetails();
    } catch (err) {
      alert(`Error updating approval: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    const isCurrentlyBlocked = data?.examiner?.isBlocked;
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this examiner?`)) return;

    setActionLoading(true);
    try {
      await apiFetch(`/admin/users/${id}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
      });
      fetchExaminerDetails();
    } catch (err) {
      alert(`Error updating block status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Examiner Profile">
        <div className="admin-empty-state">
          <h4>Loading examiner details...</h4>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.examiner) {
    return (
      <AdminLayout title="Examiner Profile">
        <div className="error-message">{error || 'Examiner not found.'}</div>
        <div style={{ marginTop: '16px' }}>
          <Link to="/admin/examiners" className="btn btn-outline">
            ← Back to All Examiners
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { examiner, quizzes = [] } = data;

  return (
    <AdminLayout
      title={`Examiner: ${examiner.name}`}
      subtitle="Complete profile inspection and quiz management records"
      actions={
        <Link to="/admin/examiners" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          ← Back to Examiners
        </Link>
      }
    >
      {/* Profile Overview Card */}
      <section className="profile-overview-card">
        <div className="profile-avatar-large">
          {examiner.name ? examiner.name.charAt(0).toUpperCase() : 'E'}
        </div>

        <div className="profile-info-block">
          <h2>{examiner.name}</h2>
          <div className="profile-info-meta">
            <span>📧 {examiner.email}</span>
            <span>📅 Registered: {new Date(examiner.createdAt).toLocaleDateString()}</span>
            <span>🆔 ID: {examiner._id}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <span
              className={`badge ${
                examiner.approvalStatus === 'approved'
                  ? 'badge-approved'
                  : examiner.approvalStatus === 'rejected'
                  ? 'badge-rejected'
                  : 'badge-pending'
              }`}
            >
              Approval: {examiner.approvalStatus}
            </span>
            <span className={`badge ${examiner.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
              Account: {examiner.isBlocked ? 'Blocked' : 'Active'}
            </span>
            {examiner.approvedBy && (
              <span style={{ fontSize: '0.82rem', color: '#64748b', alignSelf: 'center' }}>
                Approved by {examiner.approvedBy.name}
              </span>
            )}
          </div>
        </div>

        <div className="profile-actions-block">
          {examiner.approvalStatus !== 'approved' && (
            <button
              className="btn btn-primary"
              disabled={actionLoading}
              onClick={() => handleApprovalChange('approved')}
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              ✓ Approve
            </button>
          )}

          {examiner.approvalStatus !== 'rejected' && (
            <button
              className="btn btn-outline"
              disabled={actionLoading}
              onClick={() => handleApprovalChange('rejected')}
              style={{ padding: '10px 18px', fontSize: '0.88rem', borderColor: '#ef4444', color: '#ef4444' }}
            >
              ✕ Reject
            </button>
          )}

          <button
            className={`btn ${examiner.isBlocked ? 'btn-primary' : 'btn-outline'}`}
            disabled={actionLoading}
            onClick={handleBlockToggle}
            style={
              examiner.isBlocked
                ? { background: '#10b981', border: 'none', padding: '10px 18px', fontSize: '0.88rem' }
                : { background: 'rgba(239,68,68,0.08)', color: '#dc2626', borderColor: '#dc2626', padding: '10px 18px', fontSize: '0.88rem' }
            }
          >
            {examiner.isBlocked ? '✓ Unblock' : '🚫 Block'}
          </button>
        </div>
      </section>

      {/* Quizzes Created by This Examiner */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Quizzes Authored ({quizzes.length})</h3>
            <p>All examinations, publication standing, and student performance metrics</p>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📝</div>
            <h4>No Quizzes Created Yet</h4>
            <p>This examiner has not created any quizzes on the platform.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Limit</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Attempts</th>
                  <th>Unique Students</th>
                  <th>Avg Score</th>
                  <th>High / Low</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quiz.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>ID: {quiz._id}</div>
                    </td>
                    <td>
                      <span className="badge badge-community">{quiz.category}</span>
                      {quiz.communityName && (
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px' }}>
                          🏛️ {quiz.communityName}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700 }}>{quiz.questionCount || 0}</td>
                    <td>{quiz.timeLimit} mins</td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: quiz.isPrivate ? '#d97706' : '#2563eb' }}>
                        {quiz.isPrivate ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${quiz.isPublished ? 'badge-published' : 'badge-draft'}`}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{quiz.totalAttempts || 0}</td>
                    <td style={{ fontWeight: 600 }}>{quiz.uniqueAspirantCount || 0}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>
                        {quiz.averagePercentage || 0}%
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Avg: {quiz.averageScore || 0} pts
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{quiz.highestScore || 0}</span> /{' '}
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>{quiz.lowestScore || 0}</span>
                    </td>
                    <td>
                      <Link to={`/admin/quizzes/${quiz._id}`} className="btn-xs btn-xs-primary">
                        View Details →
                      </Link>
                    </td>
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

export default ExaminerProfile;
