import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api.js";
import {
  exportReportToCSV,
  printContent,
  generateReportHTML,
  formatDate,
  formatTime
} from "../../utils/reportUtils.js";
import "./StudentDetailedReport.css";

const StudentDetailedReport = ({ quiz, student, onBack }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedAttempt, setExpandedAttempt] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[StudentDetailedReport] Fetching report for:', {
        quizId: quiz._id,
        studentId: student._id,
        studentName: student.studentName
      });
      const data = await apiFetch(
        `/results/quiz/${quiz._id}/student/${student._id}/report`
      );
      console.log('[StudentDetailedReport] Report fetched successfully');
      setReport(data.report);
    } catch (err) {
      console.error('[StudentDetailedReport] Error fetching report:', err);
      const errorMsg = err.message || "Failed to fetch report";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [quiz._id, student._id]);

  const handleExportPDF = () => {
    if (!report) return;
    const filename = `${student.studentName}_${quiz.title}_Report.csv`;
    exportReportToCSV(report, filename);
  };

  const handlePrint = () => {
    if (!report) return;
    const htmlContent = generateReportHTML(report);
    printContent(
      `${student.studentName} - ${quiz.title} Report`,
      htmlContent
    );
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-back-main" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-container">
        <div className="no-data">No data available</div>
        <button className="btn btn-back-main" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  const stats = report.statistics;
  const isPass = stats.isPass ? "PASS" : "FAIL";
  const passClass = stats.isPass ? "pass" : "fail";

  return (
    <div className="report-container">
      <div className="report-header">
        <button className="btn btn-back-main" onClick={onBack}>
          ← Back to Students
        </button>
        <h1>Student Detailed Report</h1>
        <div className="report-actions">
          <button onClick={handleExportPDF} className="btn btn-export-pdf">
            📥 Export
          </button>
          <button onClick={handlePrint} className="btn btn-print-report">
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="report-content">
        {/* Student Information Section */}
        <div className="report-section">
          <div className="section-title">👤 Student Information</div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <value>{report.studentInfo.name}</value>
              </div>
              <div className="info-item">
                <label>Email</label>
                <value>{report.studentInfo.email}</value>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Information Section */}
        <div className="report-section">
          <div className="section-title">📋 Quiz Information</div>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <label>Quiz Name</label>
                <value>{report.quizInfo.title}</value>
              </div>
              <div className="info-item">
                <label>Examiner Name</label>
                <value>{report.quizInfo.examinerName}</value>
              </div>
              <div className="info-item">
                <label>Quiz Type</label>
                <value>
                  {report.quizInfo.isPrivate ? (
                    <span className="badge badge-private">Private</span>
                  ) : (
                    <span className="badge badge-public">Public</span>
                  )}
                </value>
              </div>
              <div className="info-item">
                <label>Quiz Code</label>
                <value>{report.quizInfo.quizCode || "N/A"}</value>
              </div>
              <div className="info-item">
                <label>Time Limit</label>
                <value>{report.quizInfo.timeLimit} minutes</value>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="report-section">
          <div className="section-title">📊 Performance Statistics</div>
          <div className="section-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Attempts</div>
                <div className="stat-value">{stats.totalAttempts}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Highest Score</div>
                <div className="stat-value">{stats.highestScore}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Lowest Score</div>
                <div className="stat-value">{stats.lowestScore}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Latest Score</div>
                <div className="stat-value highlight">{stats.latestScore}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Average Score</div>
                <div className="stat-value">{stats.averageScore.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Latest Percentage</div>
                <div className="stat-value">{stats.latestPercentage.toFixed(2)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Status</div>
                <div className={`stat-value status ${passClass}`}>
                  {isPass}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pass/Fail Count</div>
                <div className="stat-value">
                  ✓{stats.passCount} / ✕{stats.failCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attempt History Section */}
        <div className="report-section">
          <div className="section-title">📝 Attempt History</div>
          <div className="section-content">
            {report.attempts.length === 0 ? (
              <div className="no-attempts">No attempts recorded</div>
            ) : (
              <div className="attempts-list">
                {report.attempts.map((attempt, index) => (
                  <div key={attempt._id || index} className="attempt-item">
                    <div
                      className="attempt-header"
                      onClick={() =>
                        setExpandedAttempt(
                          expandedAttempt === index ? null : index
                        )
                      }
                    >
                      <div className="attempt-info">
                        <div className="attempt-number">Attempt #{index + 1}</div>
                        <div className="attempt-details">
                          <span className="detail">
                            Score: <strong>{attempt.score}</strong>
                          </span>
                          <span className="detail">
                            Percentage: <strong>{attempt.percentage.toFixed(2)}%</strong>
                          </span>
                          <span className="detail">
                            Date: <strong>{formatDate(attempt.createdAt)}</strong>
                          </span>
                          <span className="detail">
                            Time: <strong>{formatTime(attempt.createdAt)}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="expand-icon">
                        {expandedAttempt === index ? "▼" : "▶"}
                      </div>
                    </div>

                    {expandedAttempt === index && (
                      <div className="attempt-answers">
                        <div className="answers-title">Question Responses:</div>
                        {attempt.answers && attempt.answers.length > 0 ? (
                          <div className="answers-list">
                            {attempt.answers.map((answer, ansIndex) => (
                              <div key={ansIndex} className="answer-item">
                                <div className="q-number">Q{ansIndex + 1}</div>
                                <div className="answer-content">
                                  <div className="q-text">
                                    {answer.questionId?.question ||
                                      "Question not available"}
                                  </div>
                                  <div className="answer-status">
                                    {answer.isCorrect ? (
                                      <span className="correct">
                                        ✓ Correct
                                      </span>
                                    ) : (
                                      <span className="incorrect">
                                        ✕ Incorrect
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-answers">
                            No answer details available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="report-footer">
        <button className="btn btn-back-main" onClick={onBack}>
          ← Back to Students
        </button>
        <div className="footer-info">
          Generated on {new Date().toLocaleString()} • Online Quiz Management
          System
        </div>
      </div>
    </div>
  );
};

export default StudentDetailedReport;
