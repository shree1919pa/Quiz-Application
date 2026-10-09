import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const ExaminersList = () => {
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExaminers = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/admin/examiners');
        if (data?.success) {
          setExaminers(data.examiners || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch examiners');
      } finally {
        setLoading(false);
      }
    };

    fetchExaminers();
  }, []);

  const filteredExaminers = examiners.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="All Examiners"
      subtitle="Educator directory, quiz authoring statistics, and approval standing"
    >
      {error && <div className="error-message">{error}</div>}

      <section className="admin-card">
        <div className="admin-filters">
          <div style={{ fontWeight: 600, color: '#0f1c3f' }}>
            Total Educators: {filteredExaminers.length}
          </div>

          <div className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search examiner by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            <h4>Loading examiners...</h4>
          </div>
        ) : filteredExaminers.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">👨‍🏫</div>
            <h4>No Examiners Found</h4>
            <p>No registered examiners match your search.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Examiner</th>
                  <th>Joined Date</th>
                  <th>Total Quizzes</th>
                  <th>Published</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExaminers.map((examiner) => (
                  <tr key={examiner._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{examiner.name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{examiner.email}</div>
                    </td>
                    <td>{new Date(examiner.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }}>{examiner.totalQuizzes || 0}</td>
                    <td>
                      <span className="badge badge-published">
                        {examiner.publishedQuizzes || 0} Live
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          examiner.approvalStatus === 'approved'
                            ? 'badge-approved'
                            : examiner.approvalStatus === 'rejected'
                            ? 'badge-rejected'
                            : 'badge-pending'
                        }`}
                      >
                        {examiner.approvalStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${examiner.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
                        {examiner.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/examiners/${examiner._id}`} className="btn-xs btn-xs-primary">
                        View Full Details →
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

export default ExaminersList;
