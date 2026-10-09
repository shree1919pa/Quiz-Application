import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AspirantProfile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal for viewing attempt question-level breakdown
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchAspirantDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/admin/aspirants/${id}`);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load aspirant details:', err);
      setError(err.message || 'Failed to fetch aspirant profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAspirantDetails();
  }, [id]);

  const handleBlockToggle = async () => {
    const isCurrentlyBlocked = data?.aspirant?.isBlocked;
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this aspirant?`)) return;

    setActionLoading(true);
    try {
      await apiFetch(`/admin/users/${id}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
      });
      fetchAspirantDetails();
    } catch (err) {
      alert(`Error updating block status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const openAttemptModal = async (attemptId) => {
    setSelectedAttemptId(attemptId);
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/admin/attempts/${attemptId}`);
      if (res?.success) {
        setAttemptDetail(res.attempt);
      }
    } catch (err) {
      alert(`Failed to load attempt breakdown: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Aspirant Profile">
        <div className="admin-empty-state">
          <h4>Loading aspirant details...</h4>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.aspirant) {
    return (
      <AdminLayout title="Aspirant Profile">
        <div className="error-message">{error || 'Aspirant not found.'}</div>
        <div style={{ marginTop: '16px' }}>
          <Link to="/admin/aspirants" className="btn btn-outline">
            ← Back to All Aspirants
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { aspirant, attempts = [] } = data;

  return (
    <AdminLayout
      title={`Aspirant: ${aspirant.name}`}
      subtitle="Complete student profile and full examination performance history"
      actions={
        <Link to="/admin/aspirants" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          ← Back to Aspirants
        </Link>
      }
    >
      {/* Profile Card */}
      <section className="profile-overview-card">
        <div className="profile-avatar-large" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
          {aspirant.name ? aspirant.name.charAt(0).toUpperCase() : 'A'}
        </div>

        <div className="profile-info-block">
          <h2>{aspirant.name}</h2>
          <div className="profile-info-meta">
            <span>📧 {aspirant.email}</span>
            <span>📅 Registered: {new Date(aspirant.createdAt).toLocaleDateString()}</span>
            <span>🆔 ID: {aspirant._id}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <span className={`badge ${aspirant.isBlocked ? 'badge-blocked' : 'badge-active'}`}>
              Status: {aspirant.isBlocked ? 'Blocked' : 'Active'}
            </span>
            <span className="badge badge-aspirant">
              {attempts.length} Total Submissions
            </span>
          </div>
        </div>

        <div className="profile-actions-block">
          <button
            className={`btn ${aspirant.isBlocked ? 'btn-primary' : 'btn-outline'}`}
            disabled={actionLoading}
            onClick={handleBlockToggle}
            style={
              aspirant.isBlocked
                ? { background: '#10b981', border: 'none', padding: '10px 18px', fontSize: '0.88rem' }
                : { background: 'rgba(239,68,68,0.08)', color: '#dc2626', borderColor: '#dc2626', padding: '10px 18px', fontSize: '0.88rem' }
            }
          >
            {aspirant.isBlocked ? '✓ Unblock Aspirant' : '🚫 Block Aspirant'}
          </button>
        </div>
      </section>

      {/* Examination History Table */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Examination Performance History ({attempts.length})</h3>
            <p>Comprehensive record of all quiz attempts, scores, and answer accuracy</p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">📝</div>
            <h4>No Examination Attempts Recorded</h4>
            <p>This student has not submitted any quiz attempts yet.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Examiner</th>
                  <th>Community</th>
                  <th>Attempt Date</th>
                  <th>Questions</th>
                  <th>Correct / Incorrect</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{att.quizTitle}</div>
                      <span className="badge badge-community" style={{ marginTop: '3px' }}>
                        {att.category}
                      </span>
                    </td>
                    <td>{att.examinerName}</td>
                    <td>
                      {att.isCommunityQuiz ? (
                        <span style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.85rem' }}>
                          🏛️ {att.communityName}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Standard Quiz</span>
                      )}
                    </td>
                    <td>{new Date(att.attemptDate).toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>{att.totalQuestions}</td>
                    <td>
                      <span style={{ color: '#059669', fontWeight: 700 }}>{att.correctAnswersCount}</span> /{' '}
                      <span style={{ color: '#dc2626', fontWeight: 700 }}>{att.incorrectAnswersCount}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {att.score} / {att.totalMarks}
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>{att.percentage}%</span>
                    </td>
                    <td>
                      <span className={`badge ${att.resultStatus === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                        {att.resultStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-xs btn-xs-primary"
                        onClick={() => openAttemptModal(att._id)}
                      >
                        Inspect Answers →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Attempt Breakdown Modal */}
      {selectedAttemptId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 'min(780px, 95%)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h3>Attempt Inspection & Answer Breakdown</h3>
                {attemptDetail && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Quiz: <strong>{attemptDetail.quiz?.title}</strong> | Score:{' '}
                    <strong>
                      {attemptDetail.score} / {attemptDetail.totalMarks} ({attemptDetail.percentage}%)
                    </strong>
                  </p>
                )}
              </div>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setSelectedAttemptId(null);
                  setAttemptDetail(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {detailLoading ? (
                <div className="admin-empty-state">
                  <h4>Loading question breakdown...</h4>
                </div>
              ) : !attemptDetail ? (
                <p>Failed to load attempt details.</p>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {attemptDetail.breakdown.map((item, idx) => (
                    <div key={idx} className="question-review-card">
                      <div className="question-review-header">
                        <span className="question-number-pill">Question {idx + 1}</span>
                        <span
                          className={`badge ${item.isCorrect ? 'badge-pass' : 'badge-fail'}`}
                        >
                          {item.isCorrect ? '✓ Correct (+marks)' : '✕ Incorrect'}
                        </span>
                      </div>

                      <p className="question-text">{item.questionText}</p>

                      <div className="question-options-list">
                        {item.options.map((opt, optIdx) => {
                          const isOptionCorrect = opt === item.correctAnswer;
                          const isOptionSelected = opt === item.selectedAnswer;
                          let optClass = 'question-option-item';

                          if (isOptionCorrect) {
                            optClass += ' correct-option';
                          } else if (isOptionSelected && !item.isCorrect) {
                            optClass += ' selected-wrong';
                          }

                          return (
                            <div key={optIdx} className={optClass}>
                              <span>{opt}</span>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {isOptionCorrect && (
                                  <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                                    ✓ Correct Answer
                                  </span>
                                )}
                                {isOptionSelected && (
                                  <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                                    (Aspirant's Choice)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelectedAttemptId(null);
                  setAttemptDetail(null);
                }}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AspirantProfile;
