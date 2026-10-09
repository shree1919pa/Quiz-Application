const mongoose = require("mongoose");
const Attempt = require("../models/Attempt");
const Question = require("../models/Question");
const AIExplanation = require("../models/AIExplanation");

/**
 * Generate or retrieve a cached AI explanation for a specific question in a student's attempt.
 * POST /api/ai/explain-question
 */
const explainQuestion = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { attemptId, questionId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user."
      });
    }

    if (!attemptId || !questionId) {
      return res.status(400).json({
        success: false,
        message: "Both attemptId and questionId are required."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(attemptId) || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attemptId or questionId format."
      });
    }

    // 1. Fetch Attempt and perform strict ownership validation
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found."
      });
    }

    if (attempt.aspirantId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this quiz attempt."
      });
    }

    // 2. Verify that the question belongs to this attempt's recorded answers
    const answerEntry = attempt.answers.find(
      (a) => a.questionId && a.questionId.toString() === questionId.toString()
    );

    if (!answerEntry) {
      return res.status(400).json({
        success: false,
        message: "The requested question is not part of this quiz attempt."
      });
    }

    // 3. Check MongoDB Cache first to save AI compute and latency
    const cachedExplanation = await AIExplanation.findOne({
      attemptId: attempt._id,
      questionId: questionId,
      studentId: userId
    });

    if (cachedExplanation) {
      return res.status(200).json({
        success: true,
        cached: true,
        explanation: cachedExplanation
      });
    }

    // 4. Fetch authoritative Question details from MongoDB
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found in database."
      });
    }

    // 5. Build secure AI payload (only educational content, never credentials)
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const payload = {
      question: question.question,
      options: question.options || [],
      studentAnswer: answerEntry.selectedAnswer || "",
      correctAnswer: question.correctAnswer || "",
      isCorrect: Boolean(answerEntry.isCorrect)
    };

    let aiData;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const aiResponse = await fetch(`${aiServiceUrl}/explain-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!aiResponse.ok) {
        const errorBody = await aiResponse.text();
        console.error("[AI Service Error HTTP]", aiResponse.status, errorBody);
        return res.status(503).json({
          success: false,
          message: "AI explanation service encountered an error. Please try again."
        });
      }

      aiData = await aiResponse.json();
    } catch (fetchError) {
      console.error("[AI Service Connection Error]", fetchError.message);
      return res.status(503).json({
        success: false,
        message: "AI explanation is temporarily unavailable. Please try again."
      });
    }

    if (!aiData || !aiData.explanation) {
      return res.status(502).json({
        success: false,
        message: "Invalid response received from AI service."
      });
    }

    // 6. Cache the explanation in MongoDB
    const exp = aiData.explanation;
    const savedExplanation = await AIExplanation.findOneAndUpdate(
      {
        attemptId: attempt._id,
        questionId: question._id,
        studentId: userId
      },
      {
        attemptId: attempt._id,
        questionId: question._id,
        studentId: userId,
        studentAnswer: answerEntry.selectedAnswer || "",
        correctAnswer: question.correctAnswer || "",
        isCorrect: Boolean(answerEntry.isCorrect),
        questionExplanation: exp.questionExplanation || "",
        correctAnswerExplanation: exp.correctAnswerExplanation || "",
        studentAnswerExplanation: exp.studentAnswerExplanation || "",
        conceptExplanation: exp.conceptExplanation || "",
        example: exp.example || "",
        learningTip: exp.learningTip || "",
        provider: aiData.provider || "auto"
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    return res.status(200).json({
      success: true,
      cached: false,
      explanation: savedExplanation
    });
  } catch (error) {
    console.error("[AI Controller Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

/**
 * Get all cached AI explanations for a specific attempt.
 * GET /api/ai/explanations/:attemptId
 */
const getAttemptExplanations = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { attemptId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user."
      });
    }

    if (!attemptId || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attemptId format."
      });
    }

    // Verify ownership
    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found."
      });
    }

    if (attempt.aspirantId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view explanations for this attempt."
      });
    }

    const explanations = await AIExplanation.find({
      attemptId: attempt._id,
      studentId: userId
    });

    return res.status(200).json({
      success: true,
      explanations
    });
  } catch (error) {
    console.error("[Get Explanations Error]", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};

module.exports = {
  explainQuestion,
  getAttemptExplanations
};
