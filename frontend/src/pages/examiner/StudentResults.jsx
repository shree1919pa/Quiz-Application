import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "../../services/api.js";
import {
  exportStudentsToCSV,
  printContent,
  generatePrintHTML,
  formatDateTime
} from "../../utils/reportUtils.js";
import "./StudentResults.css";
import StudentDetailedReport from "./StudentDetailedReport.jsx";

const StudentResults = ({ quiz, onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latestAttemptDate");
  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[StudentResults] Fetching students for quiz:', quiz._id);
      const data = await apiFetch(`/results/quiz/${quiz._id}/students`);
      console.log('[StudentResults] Students fetched successfully:', data.students?.length || 0);
      setStudents(data.students || []);
    } catch (err) {
      console.error('[StudentResults] Error fetching students:', err);
      const errorMsg = err.message || "Failed to fetch students";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [quiz._id]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "studentName":
          aVal = a.studentName.toLowerCase();
          bVal = b.studentName.toLowerCase();
          break;
        case "highestScore":
          aVal = a.highestScore;
          bVal = b.highestScore;
          break;
        case "averageScore":
          aVal = a.averageScore;
          bVal = b.averageScore;
          break;
        case "attempts":
          aVal = a.totalAttempts;
          bVal = b.totalAttempts;
          break;
        case "latestAttemptDate":
        default:
          aVal = new Date(a.latestAttemptDate);
          bVal = new Date(b.latestAttemptDate);
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [students, searchTerm, sortBy, sortDirection]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailedReport(true);
  };

  const handleBackFromReport = () => {
    setShowDetailedReport(false);
    setSelectedStudent(null);
  };

  const handleExportCSV = () => {
    exportStudentsToCSV(
      filteredAndSortedStudents,
      quiz.title,
      `student-results-${quiz.title}-${new Date().getTime()}.csv`
    );
  };

  const handlePrintStudents = () => {
    const studentsHTML = filteredAndSortedStudents
      .map(
        (student) => `
        <tr>
          <td>${student.studentName}</td>
          <td>${student.studentEmail}</td>
          <td>${student.latestScore}</td>
          <td>${student.highestScore}</td>
          <td>${student.lowestScore}</td>
          <td>${student.averageScore.toFixed(2)}</td>
          <td>${student.totalAttempts}</td>
          <td>${formatDateTime(student.latestAttemptDate)}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <div class="header">
        <h1>Student Results - ${quiz.title}</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Quiz Details</div>
        <div class="info-row"><label>Quiz:</label> <value>${quiz.title}</value></div>
        <div class="info-row"><label>Type:</label> <value>${quiz.isPrivate ? "Private" : "Public"}</value></div>
        <div class="info-row"><label>Time Limit:</label> <value>${quiz.timeLimit} minutes</value></div>
      </div>

      <div class="section">
        <div class="section-title">Student Results (${filteredAndSortedStudents.length})</div>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Latest Score</th>
              <th>Highest Score</th>
              <th>Lowest Score</th>
              <th>Average Score</th>
              <th>Attempts</th>
              <th>Latest Attempt</th>
            </tr>
          </thead>
          <tbody>
            ${studentsHTML}
          </tbody>
        </table>
      </div>
    `;

    printContent(`Student Results - ${quiz.title}`, htmlContent);
  };

  if (showDetailedReport && selectedStudent) {
    return (
      <StudentDetailedReport
        quiz={quiz}
        student={selectedStudent}
        onBack={handleBackFromReport}
      />
    );
  }

  return (
    <div className="student-results-container">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Quizzes
        </button>
        <div>
          <h1>{quiz.title}</h1>
          <p className="quiz-meta">
            {quiz.isPrivate ? "🔒 Private" : "🌐 Public"} • Time Limit: {quiz.timeLimit} min
            {quiz.oneAttemptOnly && " • One Attempt Only"}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="student-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-section">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="latestAttemptDate">Latest Attempt</option>
            <option value="studentName">Name (A-Z)</option>
            <option value="highestScore">Highest Score</option>
            <option value="averageScore">Average Score</option>
            <option value="attempts">Number of Attempts</option>
          </select>

          <div className="sort-direction">
            <button
              className={`direction-btn ${sortDirection === "asc" ? "active" : ""}`}
              onClick={() => setSortDirection("asc")}
              title="Sort Ascending"
            >
              ↑
            </button>
            <button
              className={`direction-btn ${sortDirection === "desc" ? "active" : ""}`}
              onClick={() => setSortDirection("desc")}
              title="Sort Descending"
            >
              ↓
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleExportCSV} className="btn btn-export">
            📊 Export
          </button>
          <button onClick={handlePrintStudents} className="btn btn-print">
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="results-info">
        <span className="info-badge">
          {filteredAndSortedStudents.length} Students Found
        </span>
      </div>

      {loading ? (
        <div className="loading">Loading students...</div>
      ) : filteredAndSortedStudents.length === 0 ? (
        <div className="no-data">
          <p>
            {searchTerm
              ? "No students match your search."
              : "No students have attempted this quiz yet."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Latest Score</th>
                <th>Highest Score</th>
                <th>Lowest Score</th>
                <th>Average Score</th>
                <th>Attempts</th>
                <th>Latest Attempt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedStudents.map((student) => (
                <tr key={student._id}>
                  <td className="student-name">{student.studentName}</td>
                  <td>{student.studentEmail}</td>
                  <td>
                    <strong>{student.latestScore}</strong>
                  </td>
                  <td>{student.highestScore}</td>
                  <td>{student.lowestScore}</td>
                  <td>{student.averageScore.toFixed(2)}</td>
                  <td>
                    <span className="attempt-badge">{student.totalAttempts}</span>
                  </td>
                  <td>{formatDateTime(student.latestAttemptDate)}</td>
                  <td>
                    <button
                      className="btn btn-view-details"
                      onClick={() => handleViewDetails(student)}
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentResults;
