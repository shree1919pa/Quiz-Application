import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, quizzesRes] = await Promise.all([
          apiFetch('/admin/stats'),
          apiFetch('/admin/quizzes')
        ]);
        if (statsRes?.success) setStats(statsRes.stats);
        if (quizzesRes?.success) setQuizzes(quizzesRes.quizzes || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Failed to load platform analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Compute category distributions
  const categoryMap = {};
  quizzes.forEach((q) => {
    const cat = q.category || 'General Knowledge';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const topQuizzes = [...quizzes]
    .sort((a, b) => (b.totalAttempts || 0) - (a.totalAttempts || 0))
    .slice(0, 5);

  return (
    <AdminLayout
      title="Reports & Analytics"
      subtitle="Data-driven platform metrics, student participation rates, and examination engagement"
    >
      {error && <div className="error-message">{error}</div>}

      {/* Summary KPI Cards */}
      <section className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Platform Users</span>
            <div className="stat-card-icon">👥</div>
          </div>
          <div className="stat-card-value">
            {loading ? '—' : (stats?.totalExaminers || 0) + (stats?.totalAspirants || 0)}
          </div>
          <div className="stat-card-footer">
            <span>Examiners & Aspirants combined</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-card-header">
            <span className="stat-card-label">Quiz Publication Rate</span>
            <div className="stat-card-icon">📈</div>
          </div>
          <div className="stat-card-value">
            {loading || !stats?.totalQuizzes
              ? '—'
              : `${Math.round(((stats?.publishedQuizzes || 0) / stats.totalQuizzes) * 100)}%`}
          </div>
          <div className="stat-card-footer">
            <span>{stats?.publishedQuizzes || 0} of {stats?.totalQuizzes || 0} quizzes live</span>
          </div>
        </div>

        <div className="stat-card stat-teal">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Submissions</span>
            <div className="stat-card-icon">🎯</div>
          </div>
          <div className="stat-card-value">{loading ? '—' : stats?.totalQuizAttempts ?? 0}</div>
          <div className="stat-card-footer">
            <span>Completed examination attempts</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Examiner Approval Rate</span>
            <div className="stat-card-icon">🎖️</div>
          </div>
          <div className="stat-card-value">
            {loading || !stats?.totalExaminers
              ? '—'
              : `${Math.round(((stats?.approvedExaminers || 0) / stats.totalExaminers) * 100)}%`}
          </div>
          <div className="stat-card-footer">
            <span>{stats?.approvedExaminers || 0} approved accounts</span>
          </div>
        </div>
      </section>

      {/* Analytics Breakdown Grid */}
      <div className="cards-grid">
        {/* Top Active Quizzes */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Most Attempted Quizzes</h3>
              <p>Examinations with highest student participation</p>
            </div>
          </div>

          {topQuizzes.length === 0 ? (
            <div className="admin-empty-state">
              <p>No quiz attempt activity recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {topQuizzes.map((quiz, i) => (
                <div
                  key={quiz._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f1c3f' }}>
                      {i + 1}. {quiz.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      By {quiz.examinerName} • {quiz.category}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#2563eb' }}>
                      {quiz.totalAttempts || 0} attempts
                    </div>
                    <Link
                      to={`/admin/quizzes/${quiz._id}`}
                      style={{ fontSize: '0.78rem', color: '#2563eb', textDecoration: 'none' }}
                    >
                      View Report →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Quizzes by Category</h3>
              <p>Distribution of topics across the platform</p>
            </div>
          </div>

          {Object.keys(categoryMap).length === 0 ? (
            <div className="admin-empty-state">
              <p>No categories available.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {Object.entries(categoryMap).map(([category, count]) => {
                const percentage = Math.round((count / (quizzes.length || 1)) * 100);
                return (
                  <div key={category}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}
                    >
                      <span>{category}</span>
                      <span style={{ color: '#64748b' }}>
                        {count} quiz(zes) ({percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                          borderRadius: '999px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
