const express = require("express");
const router = express.Router();

const {
    getStudentCommunityQuizzes
} = require("../controllers/studentController");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

/*
=========================================================
Student Community Quizzes Route
GET /api/student/community-quizzes
=========================================================
*/
router.get(
    "/community-quizzes",
    verifyToken,
    authorizeRole("aspirant"),
    getStudentCommunityQuizzes
);

module.exports = router;
