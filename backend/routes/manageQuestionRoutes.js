const express = require("express");

const router = express.Router();

const {

    getManageQuizzes,

    getQuizQuestions,

    updateQuestion,

    deleteQuestion,

    addQuestion,

    republishQuiz

} = require("../controllers/manageQuestionController");


const {

    verifyToken,

    requireRole

} = require("../middleware/authMiddleware");



router.get(

    "/quizzes",

    verifyToken,

    requireRole("examiner"),

    getManageQuizzes

);



router.get(

    "/quizzes/:quizId",

    verifyToken,

    requireRole("examiner"),

    getQuizQuestions

);



router.put(

    "/question/:questionId",

    verifyToken,

    requireRole("examiner"),

    updateQuestion

);



router.delete(

    "/question/:questionId",

    verifyToken,

    requireRole("examiner"),

    deleteQuestion

);

router.post(
    "/question/:quizId",
    verifyToken,
    requireRole("examiner"),
    addQuestion
);

router.put(

"/republish/:quizId",

verifyToken,

requireRole("examiner"),

republishQuiz

);

module.exports = router;