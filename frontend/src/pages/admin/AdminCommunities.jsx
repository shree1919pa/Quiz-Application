import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCommunities = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        search: search.trim(),
        visibility: visibilityFilter,
        category: categoryFilter,
        sort: sortBy
      });
      const res = await apiFetch(`/admin/communities?${queryParams.toString()}`);
      if (res?.success) {
        setCommunities(res.communities || []);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
      setError(err.message || 'Failed to fetch communities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [visibilityFilter, categoryFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCommunities();
  };

  // Derive unique categories from existing list or defaults
  const categories = ['all', ...new Set(communities.map((c) => c.category).filter(Boolean))];

  return (
    <AdminLayout
      title="Community Management"
      subtitle="Complete oversight of public and private learning communities, ownership, and memberships"
    >
      {error && <div className="error-message">{error}</div>}

      <section className="admin-card">
        {/* Filters and Controls */}
        <div className="admin-filters">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${visibilityFilter === 'all' ? 'active' : ''}`}
                onClick={() => setVisibilityFilter('all')}
              >
                All ({communities.length})
              </button>
              <button
                className={`admin-tab-btn ${visibilityFilter === 'public' ? 'active' : ''}`}
                onClick={() => setVisibilityFilter('public')}
              >
                🌐 Public
              </button>
              <button
                className={`admin-tab-btn ${visibilityFilter === 'private' ? 'active' : ''}`}
                onClick={() => setVisibilityFilter('private')}
              >
                🔒 Private
              </button>
            </div>

            {categories.length > 2 && (
              <select
                className="admin-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories
                  .filter((cat) => cat !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            )}

            <select
              className="admin-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search community, code, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Communities Table */}
        {loading ? (
          <div className="admin-empty-state">
            <h4>Loading communities...</h4>
          </div>
        ) : communities.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">🏛️</div>
            <h4>No Communities Found</h4>
            <p>No learning communities match your search or filter parameters.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Community Name</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Visibility</th>
                  <th>Members</th>
                  <th>Quizzes</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((comm) => (
                  <tr key={comm._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f1c3f' }}>{comm.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Code: <strong>{comm.communityCode}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-community">{comm.category || 'General'}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{comm.ownerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{comm.ownerEmail}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: comm.visibility === 'private' ? '#d97706' : '#2563eb'
                        }}
                      >
                        {comm.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{comm.totalMembers || 1}</td>
                    <td style={{ fontWeight: 700 }}>{comm.totalQuizzes || 0}</td>
                    <td>{new Date(comm.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${comm.isActive !== false ? 'badge-active' : 'badge-blocked'}`}>
                        {comm.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/communities/${comm._id}`} className="btn-xs btn-xs-primary">
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

export default AdminCommunities;
