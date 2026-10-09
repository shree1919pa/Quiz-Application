const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const User = require("../models/User");
const Community = require("../models/Community");
const createQuiz = async (req, res) => {

    try {

        console.log("========== CREATE QUIZ ==========");
        console.log("Request Body:", req.body);

        const {

            communityId,

            category = "General Knowledge",

            ...quizData

        } = req.body;

        console.log("Community ID:", communityId);
        console.log("Category:", category);
        console.log("Quiz Data:", quizData);

        let communityName = "";
        let finalCommunityId = null;

        if (communityId && communityId !== "null" && communityId !== "") {

            if (!mongoose.Types.ObjectId.isValid(communityId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Community ID."
                });
            }

            const community = await Community.findById(communityId);

            if (!community) {

                return res.status(404).json({
                    success: false,
                    message: "Community not found."
                });

            }

            finalCommunityId = community._id;
            communityName = community.name;

        }

        const quiz = await Quiz.create({

            ...quizData,

            category: category || "General Knowledge",

            examinerId: req.user.id,

            examinerName: req.user.name,

            communityId: finalCommunityId,

            communityName

        });

        console.log("Saved Quiz:", quiz);

        if (finalCommunityId) {

            await Community.findByIdAndUpdate(

                finalCommunityId,

                {
                    $inc: {
                        totalQuizzes: 1
                    }
                }

            );

        }

        return res.status(201).json({

            success: true,

            message: "Quiz Created Successfully.",

            quiz

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;

    const question = await Question.create({
      ...req.body,
      quizId
    });

    res.status(201).json({
      message: "Question Added",
      question
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const publishQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        isPublished: true
      },
      {
        new: true
      }
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz Not Found"
      });
    }

    res.status(200).json({
      message: "Quiz Published Successfully",
      quiz
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getPublishedQuizzes = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Base query: ONLY published quizzes with NO community (communityId is null or undefined)
    const query = {
      isPublished: true,
      $or: [
        { communityId: null },
        { communityId: { $exists: false } }
      ]
    };

    let studentInterests = [];

    // If user is a student/aspirant, filter by their selected interests
    if (userRole === "aspirant" && userId) {
      const user = await User.findById(userId);
      studentInterests = user?.interests || [];

      if (studentInterests.length === 0) {
        return res.status(200).json({
          success: true,
          quizzes: [],
          studentInterests: [],
          requiresInterests: true,
          message: "Please select your interests to see recommended exams."
        });
      }

      // Filter quizzes matching any of the student's selected interests (case-insensitive)
      const interestRegexes = studentInterests.map(
        interest => new RegExp(`^${interest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")
      );

      query.category = { $in: interestRegexes };
    }

    // Get all matching published normal quizzes
    const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).lean();

    const availableQuizzes = [];

    for (const quiz of quizzes) {
      // Get total questions for this quiz
      const totalQuestions = await Question.countDocuments({
        quizId: quiz._id
      });
      quiz.totalQuestions = totalQuestions;

      // Multiple attempt quizzes are always visible
      if (!quiz.oneAttemptOnly) {
        availableQuizzes.push(quiz);
        continue;
      }

      // Find student's latest attempt
      const attempt = await Attempt.findOne({
        quizId: quiz._id,
        aspirantId: userId
      }).sort({ createdAt: -1 });

      // Student has never attempted this quiz
      if (!attempt) {
        availableQuizzes.push(quiz);
        continue;
      }

      /*
       If quiz has been republished,
       quiz.version > attempt.quizVersion

       Show quiz again.
      */
      if ((attempt.quizVersion || 1) < (quiz.version || 1)) {
        availableQuizzes.push(quiz);
      }
    }

    res.status(200).json({
      success: true,
      quizzes: availableQuizzes,
      studentInterests,
      requiresInterests: false
    });

  } catch (error) {

    console.error("Get Published Quizzes Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/*
=========================================================
Safe Community Quizzes Migration
Fixes quizzes where communityId is null but communityName matches a Community
=========================================================
*/
const migrateCommunityQuizzes = async () => {
  try {
    const orphanedQuizzes = await Quiz.find({
      $or: [
        { communityId: null },
        { communityId: { $exists: false } }
      ],
      communityName: { $exists: true, $ne: "", $ne: null }
    });

    let fixedCount = 0;

    for (const quiz of orphanedQuizzes) {
      if (!quiz.communityName || !quiz.communityName.trim()) continue;
      const trimmedName = quiz.communityName.trim();

      const matchingCommunities = await Community.find({
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
      });

      if (matchingCommunities.length === 1) {
        const matchedCommunity = matchingCommunities[0];
        quiz.communityId = matchedCommunity._id;
        quiz.communityName = matchedCommunity.name;
        await quiz.save();
        fixedCount++;
      }
    }

    console.log(`[Migration] Community Quizzes Migration finished: ${fixedCount} quizzes safely linked to communities out of ${orphanedQuizzes.length} candidates.`);
    return { totalCandidates: orphanedQuizzes.length, fixedCount };
  } catch (err) {
    console.error("[Migration] Community Quizzes Migration error:", err);
    return { error: err.message };
  }
};

const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz Not Found"
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        message: "Quiz is not published yet."
      });
    }

    const questions = await Question.find({
      quizId: req.params.quizId
    });

    res.status(200).json({
      quiz,
      questions
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const joinPrivateQuiz = async (req, res) => {
  try {
    const { quizCode } = req.body;

    const quiz = await Quiz.findOne({
      quizCode,
      isPublished: true
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Invalid Quiz Code"
      });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const verifyQuizCode = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { quizCode } = req.body;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz Not Found"
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        message: "Quiz is not published yet."
      });
    }

    if (quiz.quizCode !== quizCode) {
      return res.status(400).json({
        message: "Invalid Quiz Code"
      });
    }

    res.status(200).json({
      message: "Quiz Code Verified",
      quiz
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id;

    console.log("\n========== SUBMIT QUIZ ==========");
    console.log("User:", req.user);
    console.log("Quiz ID:", quizId);
    console.log("Aspirant ID:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized User"
      });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({
        message: "Answers are required."
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz Not Found"
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        message: "Quiz is not published yet."
      });
    }

    if (quiz.oneAttemptOnly) {
      const existingAttempt = await Attempt.findOne({
        quizId,
        aspirantId: userId,
        quizVersion: quiz.version
      });

      if (existingAttempt) {
        return res.status(400).json({
          message: "You have already attempted this quiz."
        });
      }
    }

    const questions = await Question.find({ quizId });

    if (questions.length === 0) {
      return res.status(400).json({
        message: "No Questions Found."
      });
    }

    let score = 0;
    let correct = 0;
    let wrong = 0;

    const answerList = questions.map((question) => {
      const selectedAnswer =
        answers[question._id] ??
        answers[question._id.toString()] ??
        "";

      const isCorrect =
        selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        score += question.marks;
        correct++;
      } else {
        wrong++;
      }

      return {
        questionId: question._id,
        selectedAnswer,
        isCorrect
      };
    });

    const totalMarks = questions.reduce(
      (sum, q) => sum + q.marks,
      0
    );

    const percentage =
      totalMarks === 0
        ? 0
        : (score / totalMarks) * 100;

    console.log("Saving Attempt...");

    const attempt = await Attempt.create({

    quizId,

    aspirantId: userId,

    answers: answerList,

    score,

    totalMarks,

    percentage,

    quizVersion: quiz.version

});

    console.log("Attempt Saved Successfully");
    console.log(attempt);

    return res.status(200).json({
      message: "Quiz Submitted Successfully",
      score,
      totalMarks,
      correct,
      wrong,
      percentage,
      attemptId: attempt._id,
      quizId: quiz._id
    });

  } catch (error) {
    console.error("========== SUBMIT QUIZ ERROR ==========");
    console.error(error);

    return res.status(500).json({
      message: error.message
    });
  }
};
const getLatestAttempt = async (req, res) => {
  try {
    const latestAttempt = await Attempt.findOne({
      aspirantId: req.user?.id
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestAttempt) {
      return res.status(404).json({
        message: "No attempts found."
      });
    }

    res.status(200).json(latestAttempt);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getExaminerResults = async (req, res) => {
  try {
    const examinerId = req.user?.id;
    const { search = "", quizId, startDate, endDate, sortBy = "latestAttemptDate", sortDirection = "desc", page = 1, pageSize = 10 } = req.query;

    const matchStage = {
      $expr: {
        $eq: ["$quizOwnerId", examinerId]
      }
    };

    const pipeline = [
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quiz"
        }
      },
      {
        $unwind: "$quiz"
      },
      {
        $match: {
          "quiz.examinerId": new mongoose.Types.ObjectId(examinerId)
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $group: {
          _id: {
            quizId: "$quizId",
            aspirantId: "$aspirantId"
          },
          quiz: { $first: "$quiz" },
          totalAttempts: { $sum: 1 },
          highestScore: { $max: "$score" },
          lowestScore: { $min: "$score" },
          averageScore: { $avg: "$score" },
          latestScore: { $first: "$score" },
          latestPercentage: { $first: "$percentage" },
          latestAttemptDate: { $first: "$createdAt" },
          firstAttemptDate: { $last: "$createdAt" },
          passCount: {
            $sum: {
              $cond: [{ $gte: ["$percentage", 40] }, 1, 0]
            }
          },
          failCount: {
            $sum: {
              $cond: [{ $lt: ["$percentage", 40] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.aspirantId",
          foreignField: "_id",
          as: "aspirant"
        }
      },
      {
        $unwind: "$aspirant"
      }
    ];

    const filterConditions = [];
    if (search) {
      const regex = new RegExp(search, "i");
      filterConditions.push({
        $or: [
          { "aspirant.name": { $regex: regex } },
          { "aspirant.email": { $regex: regex } },
          { "quiz.title": { $regex: regex } }
        ]
      });
    }

    if (quizId) {
      filterConditions.push({ "_id.quizId": new mongoose.Types.ObjectId(quizId) });
    }

    if (startDate) {
      filterConditions.push({ latestAttemptDate: { $gte: new Date(startDate) } });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filterConditions.push({ latestAttemptDate: { $lte: end } });
    }

    if (filterConditions.length > 0) {
      pipeline.push({ $match: { $and: filterConditions } });
    }

    const sortField = sortBy === "highestScore" ? "highestScore" : "latestAttemptDate";
    pipeline.push({ $sort: { [sortField]: sortDirection === "asc" ? 1 : -1 } });

    const totalPipeline = [...pipeline, { $count: "count" }];
    const totalCountResult = await Attempt.aggregate(totalPipeline);
    const total = totalCountResult[0]?.count || 0;

    const pageInt = parseInt(page, 10);
    const pageSizeInt = parseInt(pageSize, 10);
    pipeline.push({ $skip: (pageInt - 1) * pageSizeInt });
    pipeline.push({ $limit: pageSizeInt });

    const results = await Attempt.aggregate(pipeline);

    const formatted = results.map((row) => ({
      quizId: row._id.quizId,
      aspirantId: row._id.aspirantId,
      quizTitle: row.quiz.title,
      quizCode: row.quiz.quizCode,
      quizType: row.quiz.isPrivate ? "Private" : "Public",
      totalAttempts: row.totalAttempts,
      highestScore: row.highestScore,
      lowestScore: row.lowestScore,
      latestScore: row.latestScore,
      latestPercentage: row.latestPercentage,
      latestAttemptDate: row.latestAttemptDate,
      aspirantName: row.aspirant.name,
      aspirantEmail: row.aspirant.email,
      passCount: row.passCount,
      failCount: row.failCount,
      averageScore: row.averageScore
    }));

    res.status(200).json({
      total,
      page: pageInt,
      pageSize: pageSizeInt,
      results: formatted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

const getResultDetails = async (req, res) => {
  try {
    const { quizId, aspirantId } = req.params;
    const examinerId = req.user?.id;

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz || quiz.examinerId?.toString() !== examinerId) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    const aspirant = await User.findById(aspirantId).lean();
    if (!aspirant) {
      return res.status(404).json({ message: "Aspirant not found." });
    }

    const attempts = await Attempt.find({ quizId, aspirantId })
      .sort({ createdAt: 1 })
      .lean();

    const stats = {
      highestScore: 0,
      lowestScore: attempts.length ? attempts[0].score : 0,
      averageScore: 0,
      numberOfAttempts: attempts.length,
      firstAttemptDate: null,
      latestAttemptDate: null,
      passCount: 0,
      failCount: 0
    };

    if (attempts.length) {
      stats.highestScore = Math.max(...attempts.map((a) => a.score));
      stats.lowestScore = Math.min(...attempts.map((a) => a.score));
      stats.averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      stats.firstAttemptDate = attempts[0].createdAt;
      stats.latestAttemptDate = attempts[attempts.length - 1].createdAt;
      stats.passCount = attempts.filter((a) => a.percentage >= 40).length;
      stats.failCount = attempts.filter((a) => a.percentage < 40).length;
    }

    res.status(200).json({
      quizId: quiz._id,
      aspirantId: aspirant._id,
      aspirant: {
        name: aspirant.name,
        email: aspirant.email,
        role: aspirant.role
      },
      quiz: {
        title: quiz.title,
        examinerName: quiz.examinerName,
        quizCode: quiz.quizCode,
        timeLimit: quiz.timeLimit,
        isPrivate: quiz.isPrivate,
        showResultImmediately: quiz.showResultImmediately
      },
      attempts: attempts.map((attempt) => ({
        id: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        date: attempt.createdAt,
        pass: attempt.percentage >= 40
      })),
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const examinerId = req.user?.id;

    const attempt = await Attempt.findById(attemptId).lean();
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }

    const quiz = await Quiz.findById(attempt.quizId).lean();
    if (!quiz || quiz.examinerId?.toString() !== examinerId) {
      return res.status(403).json({ message: "Forbidden." });
    }

    await Attempt.findByIdAndDelete(attemptId);
    res.status(200).json({ message: "Attempt deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  deleteAttempt,
  migrateCommunityQuizzes
};