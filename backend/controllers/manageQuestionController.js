const Quiz = require("../models/Quiz");
const Question = require("../models/Question");


// =============================================
// Get All Quizzes
// =============================================
const getManageQuizzes = async (req, res) => {

    try {

        const examinerId = req.user.id;

        const quizzes = await Quiz.find({
            examinerId
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            quizzes
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};



// =============================================
// Get Quiz + Questions
// =============================================
const getQuizQuestions = async (req, res) => {

    try {

        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {

            return res.status(404).json({
                message: "Quiz not found"
            });

        }

        const questions = await Question.find({
            quizId
        });

        res.json({

            success: true,

            quiz,

            questions

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};



// =============================================
// Update Question
// =============================================
const updateQuestion = async (req, res) => {

    try {

        const { questionId } = req.params;

        const updatedQuestion =
            await Question.findByIdAndUpdate(

                questionId,

                req.body,

                {
                    new: true
                }

            );

        if (!updatedQuestion) {

            return res.status(404).json({

                message: "Question not found"

            });

        }

        res.json({

            success: true,

            message: "Question Updated",

            question: updatedQuestion

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};



// =============================================
// Delete Question
// =============================================
const deleteQuestion = async (req, res) => {

    try {

        const { questionId } = req.params;

        const deleted =
            await Question.findByIdAndDelete(
                questionId
            );

        if (!deleted) {

            return res.status(404).json({

                message: "Question not found"

            });

        }

        res.json({

            success: true,

            message: "Question Deleted"

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

const addQuestion = async (req, res) => {

    try {

        const { quizId } = req.params;

        const question = await Question.create({

            quizId,

            ...req.body

        });

        res.status(201).json({

            success: true,

            question

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

const republishQuiz = async (req, res) => {

    try {

        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {

            return res.status(404).json({

                message: "Quiz not found"

            });

        }

        quiz.isPublished = true;

        quiz.version += 1;

        quiz.lastRepublished = new Date();

        await quiz.save();

        res.json({

            success: true,

            message: "Quiz Republished Successfully",

            quiz

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

module.exports = {
    getManageQuizzes,

    getQuizQuestions,

    updateQuestion,

    deleteQuestion,

    addQuestion,
    
    republishQuiz

};