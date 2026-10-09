import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const ExaminerApprovals = () => {
  const [examiners, setExaminers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Modal State
  const [modalData, setModalData] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        status: statusFilter,
        search: search.trim()
      });
      const data = await apiFetch(`/admin/examiners/approvals?${queryParams.toString()}`);
      if (data?.success) {
        setExaminers(data.examiners || []);
      }
    } catch (err) {
      console.error('Failed to fetch examiner approvals:', err);
      setError(err.message || 'Failed to load examiner approval list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApprovals();
  };

  const handleActionConfirm = async () => {
    if (!modalData) return;
    const { examinerId, newStatus } = modalData;

    setActionLoading(examinerId);
    try {
      await apiFetch(`/admin/examiners/${examinerId}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      setModalData(null);
      fetchApprovals();
    } catch (err) {
      alert(`Error updating approval: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout
      title="Examiner Approvals"
      subtitle="Review and authorize educators requesting access to create examinations"
    >
      {error && <div className="error-message">{error}</div>}

      <section className="admin-card">
        {/* Filters and Search */}
        <div className="admin-filters">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              ⏳ Pending Requests
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('approved')}
            >
              ✅ Approved
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              ✕ Rejected
            </button>
            <button
              className={`admin-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Examiners
            </button>
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

        {/* Table of Examiners */}
        {loading ? (
          <div className="admin-empty-state">
            <h4>Loading examiners...</h4>
          </div>
        ) : examiners.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📁</div>
            <h4>No Examiners Found</h4>
            <p>No examiner accounts match the current filter selection.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Examiner Name</th>
                  <th>Email</th>
                  <th>Registered On</th>
                  <th>Approval Status</th>
                  <th>Approved Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {examiners.map((examiner) => (
                  <tr key={examiner._id}>
                    <td style={{ fontWeight: 600 }}>{examiner.name}</td>
                    <td>{examiner.email}</td>
                    <td>{new Date(examiner.createdAt).toLocaleDateString()}</td>
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
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {examiner.approvedAt ? (
                        <span>
                          {new Date(examiner.approvedAt).toLocaleDateString()}{' '}
                          {examiner.approvedBy ? `by ${examiner.approvedBy.name}` : ''}
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        {examiner.approvalStatus !== 'approved' && (
                          <button
                            className="btn-xs btn-xs-success"
                            onClick={() =>
                              setModalData({
                                examinerId: examiner._id,
                                examinerName: examiner.name,
                                newStatus: 'approved'
                              })
                            }
                          >
                            ✓ Approve
                          </button>
                        )}

                        {examiner.approvalStatus !== 'rejected' && (
                          <button
                            className="btn-xs btn-xs-danger"
                            onClick={() =>
                              setModalData({
                                examinerId: examiner._id,
                                examinerName: examiner.name,
                                newStatus: 'rejected'
                              })
                            }
                          >
                            ✕ Reject
                          </button>
                        )}

                        <Link to={`/admin/examiners/${examiner._id}`} className="btn-xs btn-xs-outline">
                          View Profile
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

      {/* Confirmation Modal */}
      {modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Examiner Action</h3>
              <button className="modal-close-btn" onClick={() => setModalData(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to set the status of examiner{' '}
              <strong>{modalData.examinerName}</strong> to{' '}
              <strong style={{ textTransform: 'uppercase' }}>{modalData.newStatus}</strong>?
              {modalData.newStatus === 'approved' && (
                <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#059669' }}>
                  The examiner will immediately be able to log in, create quizzes, and manage examinations.
                </p>
              )}
              {modalData.newStatus === 'rejected' && (
                <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#dc2626' }}>
                  The examiner will be prevented from logging in or creating quizzes.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setModalData(null)}>
                Cancel
              </button>
              <button
                className={`btn ${modalData.newStatus === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                style={
                  modalData.newStatus === 'rejected'
                    ? { background: '#ef4444', color: '#ffffff', border: 'none' }
                    : {}
                }
                disabled={actionLoading !== null}
                onClick={handleActionConfirm}
              >
                {actionLoading ? 'Processing...' : `Confirm ${modalData.newStatus}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ExaminerApprovals;
