import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminQuizDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); // "questions" | "attempts"

  // Attempt breakdown modal state
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchQuizDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/admin/quizzes/${id}`);
      if (res?.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load quiz details:', err);
      setError(err.message || 'Failed to fetch quiz details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchQuizDetails();
  }, [id]);

  const openAttemptModal = async (attemptId) => {
    setSelectedAttemptId(attemptId);
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/admin/attempts/${attemptId}`);
      if (res?.success) {
        setAttemptDetail(res.attempt);
      }
    } catch (err) {
      alert(`Failed to load attempt details: ${err.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Quiz Details">
        <div className="admin-empty-state">
          <h4>Loading quiz information...</h4>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data?.quiz) {
    return (
      <AdminLayout title="Quiz Details">
        <div className="error-message">{error || 'Quiz not found.'}</div>
        <div style={{ marginTop: '16px' }}>
          <Link to="/admin/quizzes" className="btn btn-outline">
            ← Back to All Quizzes
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const { quiz, questions = [], attempts = [] } = data;

  return (
    <AdminLayout
      title={`Quiz: ${quiz.title}`}
      subtitle="Complete question review, answer keys, and student submission records"
      actions={
        <Link to="/admin/quizzes" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
          ← Back to Quizzes
        </Link>
      }
    >
      {/* Quiz Overview Banner */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>{quiz.title}</h2>
            <p>
              Author: <strong>{quiz.examinerName}</strong> | Created:{' '}
              {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge ${quiz.isPublished ? 'badge-published' : 'badge-draft'}`}>
              {quiz.isPublished ? 'Published' : 'Draft'}
            </span>
            <span className="badge badge-community">Category: {quiz.category}</span>
            {quiz.communityName && (
              <span className="badge badge-community">🏛️ {quiz.communityName}</span>
            )}
          </div>
        </div>

        {/* Quick Settings Grid */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TIME LIMIT</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f1c3f' }}>{quiz.timeLimit} mins</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TOTAL QUESTIONS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2563eb' }}>{questions.length}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TOTAL ATTEMPTS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{attempts.length}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>ACCESS CODE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#7c3aed' }}>{quiz.quizCode || 'Public'}</div>
          </div>
        </div>
      </section>

      {/* Tabs Switcher: Questions vs Attempts */}
      <section className="admin-card">
        <div className="admin-card-header">
          <div className="admin-tabs">
            <button
              className={`admin-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              📝 Questions & Answer Key ({questions.length})
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'attempts' ? 'active' : ''}`}
              onClick={() => setActiveTab('attempts')}
            >
              👥 Student Attempts ({attempts.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Questions & Answers */}
        {activeTab === 'questions' && (
          <div>
            {questions.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-icon">❓</div>
                <h4>No Questions Added</h4>
                <p>This quiz does not have any questions registered yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {questions.map((q, idx) => (
                  <div key={q._id} className="question-review-card">
                    <div className="question-review-header">
                      <span className="question-number-pill">Question {idx + 1}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                        {q.marks || 1} mark(s) • {q.questionType || 'MCQ'}
                      </span>
                    </div>

                    <p className="question-text">{q.question}</p>

                    <div className="question-options-list">
                      {(q.options || []).map((opt, optIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`question-option-item ${isCorrect ? 'correct-option' : ''}`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                                ✓ Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Student Attempts */}
        {activeTab === 'attempts' && (
          <div>
            {attempts.length === 0 ? (
              <div className="admin-empty-state">
                <div className="admin-empty-icon">🎓</div>
                <h4>No Submissions Yet</h4>
                <p>No aspirants have submitted attempts for this quiz.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Aspirant</th>
                      <th>Submission Date</th>
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
                          <div style={{ fontWeight: 600 }}>{att.aspirantName}</div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{att.aspirantEmail}</div>
                        </td>
                        <td>{new Date(att.attemptDate).toLocaleString()}</td>
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
                            View Submission →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Attempt Breakdown Modal */}
      {selectedAttemptId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: 'min(780px, 95%)', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h3>Student Attempt Breakdown</h3>
                {attemptDetail && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Student: <strong>{attemptDetail.aspirant?.name}</strong> ({attemptDetail.aspirant?.email}) |
                    Score: <strong>{attemptDetail.score} / {attemptDetail.totalMarks} ({attemptDetail.percentage}%)</strong>
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
                  <h4>Loading attempt questions...</h4>
                </div>
              ) : !attemptDetail ? (
                <p>Failed to load attempt details.</p>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {attemptDetail.breakdown.map((item, idx) => (
                    <div key={idx} className="question-review-card">
                      <div className="question-review-header">
                        <span className="question-number-pill">Question {idx + 1}</span>
                        <span className={`badge ${item.isCorrect ? 'badge-pass' : 'badge-fail'}`}>
                          {item.isCorrect ? '✓ Correct' : '✕ Incorrect'}
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
                                    (Student Selected)
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
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuizDetails;
