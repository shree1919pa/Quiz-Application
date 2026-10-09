import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "../../services/api.js";
import {
  exportQuizzesToCSV,
  printContent,
  generatePrintHTML,
  formatDateTime
} from "../../utils/reportUtils.js";
import "./QuizResultsDashboard.css";
import StudentResults from "./StudentResults.jsx";

const QuizResultsDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterType, setFilterType] = useState("all"); // all, public, private

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showStudentResults, setShowStudentResults] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[QuizResultsDashboard] Fetching quizzes from /results/quizzes');
      const data = await apiFetch("/results/quizzes");
      console.log('[QuizResultsDashboard] Quizzes fetched successfully:', data.quizzes?.length || 0);
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error('[QuizResultsDashboard] Error fetching quizzes:', err);
      const errorMsg = err.message || "Failed to fetch quizzes";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === "public") {
      filtered = filtered.filter((quiz) => !quiz.isPrivate);
    } else if (filterType === "private") {
      filtered = filtered.filter((quiz) => quiz.isPrivate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "students":
          aVal = a.totalStudents;
          bVal = b.totalStudents;
          break;
        case "attempts":
          aVal = a.totalAttempts;
          bVal = b.totalAttempts;
          break;
        case "averageScore":
          aVal = a.averageScore;
          bVal = b.averageScore;
          break;
        case "createdAt":
        default:
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quizzes, searchTerm, sortBy, sortDirection, filterType]);

  const handleViewResults = (quiz) => {
    setSelectedQuiz(quiz);
    setShowStudentResults(true);
  };

  const handleBackFromStudents = () => {
    setShowStudentResults(false);
    setSelectedQuiz(null);
  };

  const handleExportCSV = () => {
    exportQuizzesToCSV(
      filteredAndSortedQuizzes,
      `quiz-results-${new Date().getTime()}.csv`
    );
  };

  const handlePrintDashboard = () => {
    const quizzesHTML = filteredAndSortedQuizzes
      .map(
        (quiz) => `
        <tr>
          <td>${quiz.title}</td>
          <td>${quiz.isPrivate ? "Private" : "Public"}</td>
          <td>${quiz.totalStudents}</td>
          <td>${quiz.totalAttempts}</td>
          <td>${quiz.averageScore.toFixed(2)}</td>
          <td>${quiz.highestScore}</td>
          <td>${quiz.lowestScore}</td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <div class="header">
        <h1>Quiz Results Dashboard</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <div class="section-title">Quiz Results Summary</div>
        <table>
          <thead>
            <tr>
              <th>Quiz Name</th>
              <th>Type</th>
              <th>Students</th>
              <th>Attempts</th>
              <th>Avg Score</th>
              <th>Highest</th>
              <th>Lowest</th>
            </tr>
          </thead>
          <tbody>
            ${quizzesHTML}
          </tbody>
        </table>
      </div>
    `;

    const fullHTML = generatePrintHTML("Quiz Results Dashboard", htmlContent);
    printContent("Quiz Results Dashboard", htmlContent);
  };

  if (showStudentResults && selectedQuiz) {
    return (
      <StudentResults quiz={selectedQuiz} onBack={handleBackFromStudents} />
    );
  }

  return (
    <div className="quiz-dashboard-container">
      <div className="dashboard-header">
        <h1>Quiz Results Dashboard</h1>
        <p>Monitor and analyze results from your quizzes</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-controls">
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by quiz name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Quiz Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="createdAt">Latest First</option>
              <option value="title">Quiz Name (A-Z)</option>
              <option value="students">Total Students</option>
              <option value="attempts">Total Attempts</option>
              <option value="averageScore">Average Score</option>
            </select>
          </div>

          <div className="sort-direction">
            <button
              className={`direction-btn ${sortDirection === "asc" ? "active" : ""}`}
              onClick={() => setSortDirection("asc")}
              title="Sort Ascending"
            >
              ↑ ASC
            </button>
            <button
              className={`direction-btn ${sortDirection === "desc" ? "active" : ""}`}
              onClick={() => setSortDirection("desc")}
              title="Sort Descending"
            >
              ↓ DESC
            </button>
          </div>
        </div>

        <div className="export-actions">
          <button onClick={handleExportCSV} className="btn btn-export">
            📊 Export CSV
          </button>
          <button onClick={handlePrintDashboard} className="btn btn-print">
            🖨️ Print
          </button>
        </div>
      </div>

      <div className="results-summary">
        <div className="summary-card">
          <div className="summary-value">{filteredAndSortedQuizzes.length}</div>
          <div className="summary-label">Total Quizzes</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {filteredAndSortedQuizzes.reduce((sum, q) => sum + q.totalStudents, 0)}
          </div>
          <div className="summary-label">Total Students</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {filteredAndSortedQuizzes.reduce((sum, q) => sum + q.totalAttempts, 0)}
          </div>
          <div className="summary-label">Total Attempts</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">
            {filteredAndSortedQuizzes.length > 0
              ? (
                  filteredAndSortedQuizzes.reduce((sum, q) => sum + q.averageScore, 0) /
                  filteredAndSortedQuizzes.length
                ).toFixed(2)
              : "0.00"}
          </div>
          <div className="summary-label">Avg Score</div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading quizzes...</div>
      ) : filteredAndSortedQuizzes.length === 0 ? (
        <div className="no-data">
          <p>No quizzes found. {searchTerm && "Try adjusting your filters."}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Type</th>
                <th>Students</th>
                <th>Attempts</th>
                <th>Avg Score</th>
                <th>Highest</th>
                <th>Lowest</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedQuizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td className="quiz-name">
                    <strong>{quiz.title}</strong>
                    {quiz.oneAttemptOnly && (
                      <span className="badge badge-one-attempt">One Attempt</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${quiz.isPrivate ? "private" : "public"}`}>
                      {quiz.isPrivate ? "Private" : "Public"}
                    </span>
                  </td>
                  <td>{quiz.totalStudents}</td>
                  <td>{quiz.totalAttempts}</td>
                  <td>
                    <strong>{quiz.averageScore.toFixed(2)}</strong>
                  </td>
                  <td>{quiz.highestScore}</td>
                  <td>{quiz.lowestScore}</td>
                  <td>
                    <button
                      className="btn btn-view-results"
                      onClick={() => handleViewResults(quiz)}
                    >
                      View Results →
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

export default QuizResultsDashboard;
