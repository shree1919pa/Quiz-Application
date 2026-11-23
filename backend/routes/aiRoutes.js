const express = require("express");
const router = express.Router();
const { explainQuestion, getAttemptExplanations } = require("../controllers/aiController");
const { verifyToken, authorizeRole } = require("../middleware/authMiddleware");

// Route to generate or retrieve an AI question explanation for an attempt
router.post(
  "/explain-question",
  verifyToken,
  authorizeRole(["aspirant", "admin"]),
  explainQuestion
);

// Route to get all cached explanations for an attempt
router.get(
  "/explanations/:attemptId",
  verifyToken,
  authorizeRole(["aspirant", "admin"]),
  getAttemptExplanations
);

module.exports = router;
