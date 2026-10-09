import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminCommunityDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Member filters
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');

  const fetchCommunityDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/admin/communities/${id}`);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load community details:', err);
      setError(err.message || 'Failed to fetch community details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCommunityDetails();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Community Details">
        <div className="admin-empty-state">
          <h4>Loading community information...</h4>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.community) {
    return (
      <AdminLayout title="Community Details">
        <div className="error-message">{error || 'Community not found.'}</div>
        <div style={{ marginTop: '16px' }}>
          <Link to="/admin/communities" className="btn btn-outline">
            ← Back to Communities
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { community, owner, statistics, members = [], quizzes = [] } = data;

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase());

    const matchesRole =
      memberRoleFilter === 'all' ||
      (memberRoleFilter === 'owner' && m.isOwner) ||
      (memberRoleFilter === 'examiner' && m.role === 'Examiner') ||
      (memberRoleFilter === 'aspirant' && m.role === 'Aspirant');

    const matchesStatus =
      memberStatusFilter === 'all' ||
      (memberStatusFilter === 'active' && !m.isBlocked) ||
      (memberStatusFilter === 'blocked' && m.isBlocked);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminLayout
      title={`Community: ${community.name}`}
      subtitle="Complete administrative inspection of membership, creator profile, and hosted examinations"
      actions={
        <Link to="/admin/communities" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          ← Back to Communities
        </Link>
      }
    >
      {/* 1. Community Statistics KPI Cards */}
      <section className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Members</span>
            <div className="stat-card-icon">👥</div>
          </div>
          <div className="stat-card-value">{statistics?.totalMembers ?? members.length}</div>
          <div className="stat-card-footer">
            <span>Enrolled participants</span>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Examiners Joined</span>
            <div className="stat-card-icon">👨‍🏫</div>
          </div>
          <div className="stat-card-value">{statistics?.totalExaminers ?? 0}</div>
          <div className="stat-card-footer">
            <span>Contributing educators</span>
          </div>
        </div>

        <div className="stat-card stat-teal">
          <div className="stat-card-header">
            <span className="stat-card-label">Aspirants Joined</span>
            <div className="stat-card-icon">🎓</div>
          </div>
          <div className="stat-card-value">{statistics?.totalAspirants ?? 0}</div>
          <div className="stat-card-footer">
            <span>Enrolled students</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Quizzes</span>
            <div className="stat-card-icon">📝</div>
          </div>
          <div className="stat-card-value">{statistics?.totalQuizzes ?? quizzes.length}</div>
          <div className="stat-card-footer">
            <span>Authored in community</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Attempts</span>
            <div className="stat-card-icon">📊</div>
          </div>
          <div className="stat-card-value">{statistics?.totalQuizAttempts ?? 0}</div>
          <div className="stat-card-footer">
            <span>Student submissions</span>
          </div>
        </div>
      </section>

      {/* 2. Community Info & Owner Details Grid */}
      <div className="cards-grid">
        {/* Community Info Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Community Information</h3>
              <p>Core metadata and access parameters</p>
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: community.visibility === 'private' ? '#d97706' : '#2563eb'
              }}
            >
              {community.visibility === 'private' ? '🔒 Private Community' : '🌐 Public Community'}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>NAME:</strong>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f1c3f' }}>{community.name}</div>
            </div>

            <div>
              <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>DESCRIPTION:</strong>
              <div style={{ color: '#334155', fontSize: '0.92rem' }}>
                {community.description || 'No description provided.'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>CATEGORY:</strong>
                <div>
                  <span className="badge badge-community">{community.category || 'General'}</span>
                </div>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>JOIN CODE:</strong>
                <div style={{ fontWeight: 700, color: '#7c3aed' }}>{community.communityCode}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>CREATED ON:</strong>
                <div>{new Date(community.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>STATUS:</strong>
                <div>
                  <span className={`badge ${community.isActive !== false ? 'badge-active' : 'badge-blocked'}`}>
                    {community.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Community Owner</h3>
              <p>Educator holding administrative authority</p>
            </div>
            <span className="badge badge-examiner">👑 Primary Owner</span>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>FULL NAME:</strong>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f1c3f' }}>{owner?.name || community.ownerName}</div>
            </div>

            <div>
              <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>EMAIL:</strong>
              <div style={{ color: '#334155', fontSize: '0.95rem' }}>{owner?.email || 'N/A'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>ROLE:</strong>
                <div>
                  <span className="badge badge-examiner">{owner?.role || 'examiner'}</span>
                </div>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>ACCOUNT STANDING:</strong>
                <div>
                  <span className={`badge ${owner?.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
                    {owner?.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {owner?.createdAt && (
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#64748b' }}>JOINED PLATFORM:</strong>
                <div>{new Date(owner.createdAt).toLocaleDateString()}</div>
              </div>
            )}

            <div style={{ marginTop: '8px' }}>
              <Link to={`/admin/examiners/${owner?._id || community.ownerId}`} className="btn-xs btn-xs-primary">
                View Full Examiner Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Community Members Section */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Enrolled Community Members ({filteredMembers.length})</h3>
            <p>Roster of examiners and aspirants who have joined this community</p>
          </div>
        </div>

        {/* Member Filters */}
        <div className="admin-filters">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="admin-tabs">
              <button
                className={`admin-tab-btn ${memberRoleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setMemberRoleFilter('all')}
              >
                All Members
              </button>
              <button
                className={`admin-tab-btn ${memberRoleFilter === 'owner' ? 'active' : ''}`}
                onClick={() => setMemberRoleFilter('owner')}
              >
                👑 Owner
              </button>
              <button
                className={`admin-tab-btn ${memberRoleFilter === 'examiner' ? 'active' : ''}`}
                onClick={() => setMemberRoleFilter('examiner')}
              >
                👨‍🏫 Examiners
              </button>
              <button
                className={`admin-tab-btn ${memberRoleFilter === 'aspirant' ? 'active' : ''}`}
                onClick={() => setMemberRoleFilter('aspirant')}
              >
                🎓 Aspirants
              </button>
            </div>

            <select
              className="admin-select"
              value={memberStatusFilter}
              onChange={(e) => setMemberStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="admin-search-box">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search member by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">👥</div>
            <h4>No Members Found</h4>
            <p>No community members matched your filter criteria.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Community Role</th>
                  <th>Date Joined</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{member.name}</div>
                      {member.isOwner && (
                        <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
                          👑 Community Owner
                        </span>
                      )}
                    </td>
                    <td>{member.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          member.isOwner
                            ? 'badge-approved'
                            : member.role === 'Examiner'
                            ? 'badge-examiner'
                            : 'badge-aspirant'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${member.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
                        {member.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {member.role === 'Aspirant' ? (
                        <Link to={`/admin/aspirants/${member.userId}`} className="btn-xs btn-xs-outline">
                          View History
                        </Link>
                      ) : (
                        <Link to={`/admin/examiners/${member.userId}`} className="btn-xs btn-xs-outline">
                          View Profile
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. Community Quizzes Section */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Community Quizzes ({quizzes.length})</h3>
            <p>Examinations created specifically under this learning community</p>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📝</div>
            <h4>No Quizzes in this Community</h4>
            <p>No quizzes have been created or published under this community yet.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Creator</th>
                  <th>Questions</th>
                  <th>Time Limit</th>
                  <th>Publication</th>
                  <th>Total Attempts</th>
                  <th>Unique Students</th>
                  <th>Avg Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{quiz.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Code: {quiz.quizCode || 'N/A'}
                      </div>
                    </td>
                    <td>{quiz.examinerName}</td>
                    <td style={{ fontWeight: 700 }}>{quiz.questionCount || 0}</td>
                    <td>{quiz.timeLimit} mins</td>
                    <td>
                      <span className={`badge ${quiz.isPublished ? 'badge-published' : 'badge-draft'}`}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{quiz.totalAttempts || 0}</td>
                    <td style={{ fontWeight: 600 }}>{quiz.uniqueAspirantsCount || 0}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>
                        {quiz.averagePercentage || 0}%
                      </span>
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

export default AdminCommunityDetails;
