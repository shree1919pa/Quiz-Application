import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AspirantsList = () => {
  const [aspirants, setAspirants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAspirants = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/admin/aspirants');
        if (data?.success) {
          setAspirants(data.aspirants || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch aspirants');
      } finally {
        setLoading(false);
      }
    };

    fetchAspirants();
  }, []);

  const filteredAspirants = aspirants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="All Aspirants"
      subtitle="Student registry, test participation history, and performance standing"
    >
      {error && <div className="error-message">{error}</div>}

      <section className="admin-card">
        <div className="admin-filters">
          <div style={{ fontWeight: 600, color: '#0f1c3f' }}>
            Total Aspirants: {filteredAspirants.length}
          </div>

          <div className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-empty-state">
            <h4>Loading aspirants...</h4>
          </div>
        ) : filteredAspirants.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🎓</div>
            <h4>No Aspirants Found</h4>
            <p>No registered aspirants match your search criteria.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Aspirant</th>
                  <th>Joined Date</th>
                  <th>Quizzes Attempted</th>
                  <th>Avg Score %</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAspirants.map((aspirant) => (
                  <tr key={aspirant._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{aspirant.name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{aspirant.email}</div>
                    </td>
                    <td>{new Date(aspirant.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }}>{aspirant.totalAttempts || 0}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>
                        {aspirant.averagePercentage || 0}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${aspirant.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
                        {aspirant.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/aspirants/${aspirant._id}`} className="btn-xs btn-xs-primary">
                        View History →
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

export default AspirantsList;
