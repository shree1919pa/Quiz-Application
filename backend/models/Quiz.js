const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        examinerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        examinerName: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true,
            default: "General Knowledge"
        },

        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            default: null
        },

        communityName: {
            type: String,
            default: ""
        },
        timeLimit: {
            type: Number,
            required: true
        },

        quizCode: {
            type: String,
            default: ""
        },

        isPrivate: {
            type: Boolean,
            default: false
        },

        shuffleQuestions: {
            type: Boolean,
            default: false
        },

        oneAttemptOnly: {
            type: Boolean,
            default: false
        },

        showResultImmediately: {
            type: Boolean,
            default: false
        },

        isPublished: {
            type: Boolean,
            default: false
        },
        version: {
            type: Number,
            default: 1
        },

        lastRepublished: {
            type: Date
        },
    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Quiz", quizSchema);