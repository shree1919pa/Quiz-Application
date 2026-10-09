const mongoose = require("mongoose");

const aiExplanationSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
      index: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    studentAnswer: {
      type: String,
      default: ""
    },
    correctAnswer: {
      type: String,
      default: ""
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    questionExplanation: {
      type: String,
      default: ""
    },
    correctAnswerExplanation: {
      type: String,
      default: ""
    },
    studentAnswerExplanation: {
      type: String,
      default: ""
    },
    conceptExplanation: {
      type: String,
      default: ""
    },
    example: {
      type: String,
      default: ""
    },
    learningTip: {
      type: String,
      default: ""
    },
    provider: {
      type: String,
      default: "auto"
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure quick retrieval and prevent duplicates
aiExplanationSchema.index(
  { attemptId: 1, questionId: 1, studentId: 1 },
  { unique: true }
);

module.exports = mongoose.model("AIExplanation", aiExplanationSchema);
