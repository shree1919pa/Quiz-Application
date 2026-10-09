const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");
const User = require("../models/User");

// Level 1: Get all quizzes for the examiner with statistics
const getExaminerQuizzes = async (req, res) => {
  try {
    const examinerId = req.user?.id;

    const quizzes = await Quiz.aggregate([
      // Match quizzes created by the examiner
      {
        $match: {
          examinerId: new mongoose.Types.ObjectId(examinerId)
        }
      },
      // Lookup attempts
      {
        $lookup: {
          from: "attempts",
          localField: "_id",
          foreignField: "quizId",
          as: "attempts"
        }
      },
      // Add computed fields
      {
        $addFields: {
          totalAttempts: { $size: "$attempts" },
          totalStudents: { $size: { $setUnion: ["$attempts.aspirantId"] } },
          averageScore: {
            $cond: [
              { $eq: [{ $size: "$attempts" }, 0] },
              0,
              { $avg: "$attempts.score" }
            ]
          },
          highestScore: { $max: "$attempts.score" },
          lowestScore: {
            $cond: [
              { $eq: [{ $size: "$attempts" }, 0] },
              0,
              { $min: "$attempts.score" }
            ]
          }
        }
      },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          title: 1,
          isPrivate: 1,
          totalStudents: 1,
          totalAttempts: 1,
          averageScore: 1,
          highestScore: 1,
          lowestScore: 1,
          timeLimit: 1,
          quizCode: 1,
          oneAttemptOnly: 1,
          isPublished: 1,
          createdAt: 1,
          updatedAt: 1,
          attempts: 1
        }
      },
      // Sort
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.status(200).json({
      message: "Quizzes fetched successfully",
      quizzes
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching quizzes",
      error: error.message
    });
  }
};

// Level 2: Get students who attempted a specific quiz
const getStudentsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const examinerId = req.user?.id;

    // Verify quiz belongs to examiner
    const quiz = await Quiz.findOne({
      _id: quizId,
      examinerId: examinerId
    });

    if (!quiz) {
      return res.status(403).json({
        message: "Unauthorized: Quiz not found or not owned by you"
      });
    }

    const students = await Attempt.aggregate([
      // Match attempts for this quiz
      {
        $match: {
          quizId: new mongoose.Types.ObjectId(quizId)
        }
      },
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "aspirantId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      {
        $unwind: "$studentInfo"
      },
      // Group by student
      {
        $group: {
          _id: "$aspirantId",
          studentName: { $first: "$studentInfo.name" },
          studentEmail: { $first: "$studentInfo.email" },
          attempts: { $push: "$$ROOT" },
          totalAttempts: { $sum: 1 },
          highestScore: { $max: "$score" },
          lowestScore: { $min: "$score" },
          averageScore: { $avg: "$score" },
          latestScore: { $last: "$score" },
          latestAttemptDate: { $max: "$createdAt" }
        }
      },
      // Sort by latest attempt
      {
        $sort: { latestAttemptDate: -1 }
      },
      // Project final fields
      {
        $project: {
          _id: 1,
          studentName: 1,
          studentEmail: 1,
          totalAttempts: 1,
          highestScore: 1,
          lowestScore: 1,
          averageScore: 1,
          latestScore: 1,
          latestAttemptDate: 1,
          attempts: 1
        }
      }
    ]);

    res.status(200).json({
      message: "Students fetched successfully",
      students
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching students",
      error: error.message
    });
  }
};

// Level 3: Get detailed attempt history for a student on a quiz
const getStudentAttemptHistory = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    const examinerId = req.user?.id;

    // Verify quiz belongs to examiner
    const quiz = await Quiz.findOne({
      _id: quizId,
      examinerId: examinerId
    });

    if (!quiz) {
      return res.status(403).json({
        message: "Unauthorized: Quiz not found or not owned by you"
      });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get all attempts with detailed information
    const attempts = await Attempt.find({
      quizId: quizId,
      aspirantId: studentId
    })
      .lean()
      .sort({ createdAt: -1 });

    // Calculate statistics
    const statistics = {
      totalAttempts: attempts.length,
      highestScore: Math.max(...attempts.map(a => a.score), 0),
      lowestScore: Math.min(...attempts.map(a => a.score), 0),
      latestScore: attempts[0]?.score || 0,
      averageScore: attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0,
      latestPercentage: attempts[0]?.percentage || 0,
      passCount: attempts.filter(a => a.percentage >= 50).length,
      failCount: attempts.filter(a => a.percentage < 50).length
    };

    // If oneAttemptOnly is enabled, return only the latest attempt
    const filteredAttempts = quiz.oneAttemptOnly ? [attempts[0]] : attempts;

    res.status(200).json({
      message: "Attempt history fetched successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        examinerName: quiz.examinerName,
        timeLimit: quiz.timeLimit,
        quizCode: quiz.quizCode,
        isPrivate: quiz.isPrivate,
        oneAttemptOnly: quiz.oneAttemptOnly
      },
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      },
      statistics,
      attempts: filteredAttempts
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching attempt history",
      error: error.message
    });
  }
};

// Get single student detailed report (enhanced version)
const getStudentDetailedReport = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    const examinerId = req.user?.id;

    // Verify quiz belongs to examiner
    const quiz = await Quiz.findOne({
      _id: quizId,
      examinerId: examinerId
    });

    if (!quiz) {
      return res.status(403).json({
        message: "Unauthorized"
      });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get examiner details
    const examiner = await User.findById(examinerId);

    // Get attempts
    const attempts = await Attempt.find({
      quizId: quizId,
      aspirantId: studentId
    })
      .populate({
        path: "answers.questionId",
        select: "question correctAnswer marks"
      })
      .lean()
      .sort({ createdAt: -1 });

    // Calculate statistics
    const statistics = {
      totalAttempts: attempts.length,
      highestScore: Math.max(...attempts.map(a => a.score), 0),
      lowestScore: Math.min(...attempts.map(a => a.score), 0),
      latestScore: attempts[0]?.score || 0,
      averageScore: attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : 0,
      latestPercentage: attempts[0]?.percentage || 0,
      isPass: (attempts[0]?.percentage || 0) >= 50,
      passCount: attempts.filter(a => a.percentage >= 50).length,
      failCount: attempts.filter(a => a.percentage < 50).length
    };

    res.status(200).json({
      message: "Detailed report fetched successfully",
      report: {
        studentInfo: {
          name: student.name,
          email: student.email
        },
        quizInfo: {
          title: quiz.title,
          examinerName: quiz.examinerName,
          isPrivate: quiz.isPrivate,
          timeLimit: quiz.timeLimit,
          quizCode: quiz.quizCode
        },
        statistics,
        attempts: quiz.oneAttemptOnly ? [attempts[0]] : attempts
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching detailed report",
      error: error.message
    });
  }
};

module.exports = {
  getExaminerQuizzes,
  getStudentsByQuiz,
  getStudentAttemptHistory,
  getStudentDetailedReport
};
