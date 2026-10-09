const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },

        aspirantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        answers: [
            {
                questionId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question"
                },

                selectedAnswer: String,

                isCorrect: Boolean
            }
        ],

        score: {
            type: Number,
            default: 0
        },

        totalMarks: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        },
        quizVersion: {
            type: Number,
            default: 1
        },

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Attempt", attemptSchema);