const express = require("express");

const router = express.Router();

const {
  createQuiz,
  addQuestion,
  publishQuiz,
  getPublishedQuizzes,
  getQuizDetails,
  joinPrivateQuiz,
  verifyQuizCode,
  submitQuiz,
  getLatestAttempt,
  getExaminerResults,
  getResultDetails,
  deleteAttempt
} = require("../controllers/quizController");

const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

router.post("/create", verifyToken, authorizeRole("examiner"), createQuiz);
router.post("/:quizId/question", verifyToken, authorizeRole("examiner"), addQuestion);
router.put("/:quizId/publish", verifyToken, authorizeRole("examiner"), publishQuiz);
router.get("/published", verifyToken, getPublishedQuizzes);
router.get("/attempt/latest", verifyToken, getLatestAttempt);
router.get("/results", verifyToken, authorizeRole("examiner"), getExaminerResults);
router.get("/results/:quizId/:aspirantId", verifyToken, authorizeRole("examiner"), getResultDetails);
router.delete("/attempt/:attemptId", verifyToken, authorizeRole("examiner"), deleteAttempt);
router.get("/:quizId", verifyToken, getQuizDetails);
router.post("/join", verifyToken, joinPrivateQuiz);
router.post("/:quizId/verify", verifyToken, verifyQuizCode);
router.post("/:quizId/submit", verifyToken, submitQuiz);

module.exports = router;