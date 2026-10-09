import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminQuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        status: statusFilter,
        search: search.trim()
      });
      const data = await apiFetch(`/admin/quizzes?${queryParams.toString()}`);
      if (data?.success) {
        setQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
      setError(err.message || 'Failed to load quizzes list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes();
  };

  return (
    <AdminLayout
      title="Quiz Management"
      subtitle="Administrative inspection of all platform examinations, questions, and attempt performance"
    >
      {error && <div className="error-message">{error}</div>}

      <section className="admin-card">
        {/* Filters and Search */}
        <div className="admin-filters">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Quizzes
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'published' ? 'active' : ''}`}
              onClick={() => setStatusFilter('published')}
            >
              🌐 Published
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'draft' ? 'active' : ''}`}
              onClick={() => setStatusFilter('draft')}
            >
              📝 Drafts
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, examiner, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Quizzes Table */}
        {loading ? (
          <div className="admin-empty-state">
            <h4>Loading quizzes...</h4>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📝</div>
            <h4>No Quizzes Found</h4>
            <p>No examinations matched your search or filter parameters.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Examiner</th>
                  <th>Category</th>
                  <th>Time Limit</th>
                  <th>Questions</th>
                  <th>Submissions</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quiz.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Code: {quiz.quizCode || 'None'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{quiz.examinerName}</div>
                    </td>
                    <td>
                      <span className="badge badge-community">{quiz.category}</span>
                      {quiz.communityName && (
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px' }}>
                          🏛️ {quiz.communityName}
                        </div>
                      )}
                    </td>
                    <td>{quiz.timeLimit} mins</td>
                    <td style={{ fontWeight: 700 }}>{quiz.questionCount || 0}</td>
                    <td style={{ fontWeight: 700 }}>{quiz.totalAttempts || 0}</td>
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
                    <td>
                      <Link to={`/admin/quizzes/${quiz._id}`} className="btn-xs btn-xs-primary">
                        Inspect Quiz →
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

export default AdminQuizManagement;
