const express = require("express");
const router = express.Router();

const {
  getExaminerQuizzes,
  getStudentsByQuiz,
  getStudentAttemptHistory,
  getStudentDetailedReport
} = require("../controllers/resultController");

const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

// Level 1: Get all quizzes created by examiner with statistics
router.get(
  "/quizzes",
  verifyToken,
  authorizeRole("examiner"),
  getExaminerQuizzes
);

// Level 2: Get all students who attempted a specific quiz
router.get(
  "/quiz/:quizId/students",
  verifyToken,
  authorizeRole("examiner"),
  getStudentsByQuiz
);

// Level 3: Get detailed attempt history for a student on a quiz
router.get(
  "/quiz/:quizId/student/:studentId/attempts",
  verifyToken,
  authorizeRole("examiner"),
  getStudentAttemptHistory
);

// Level 3: Get detailed report for a student
router.get(
  "/quiz/:quizId/student/:studentId/report",
  verifyToken,
  authorizeRole("examiner"),
  getStudentDetailedReport
);

module.exports = router;
