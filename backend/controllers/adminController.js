const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");

// ==========================================
// 1. Dashboard Statistics
// GET /api/admin/stats
// ==========================================
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalExaminers,
            pendingApprovals,
            approvedExaminers,
            totalAspirants,
            blockedUsers,
            totalQuizzes,
            publishedQuizzes,
            totalQuizAttempts,
            recentPendingExaminers,
            recentAttempts
        ] = await Promise.all([
            User.countDocuments({ role: "examiner" }),
            User.countDocuments({ role: "examiner", approvalStatus: "pending" }),
            User.countDocuments({ role: "examiner", approvalStatus: "approved" }),
            User.countDocuments({ role: "aspirant" }),
            User.countDocuments({ isBlocked: true }),
            Quiz.countDocuments(),
            Quiz.countDocuments({ isPublished: true }),
            Attempt.countDocuments(),
            User.find({ role: "examiner", approvalStatus: "pending" })
                .select("-password")
                .sort({ createdAt: -1 })
                .limit(5),
            Attempt.find()
                .populate("quizId", "title category")
                .populate("aspirantId", "name email")
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalExaminers,
                pendingExaminerApprovals: pendingApprovals,
                approvedExaminers,
                totalAspirants,
                blockedUsers,
                totalQuizzes,
                publishedQuizzes,
                totalQuizAttempts
            },
            recentPendingExaminers,
            recentAttempts
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. Examiner Approvals List & Action
// GET /api/admin/examiners/approvals
// ==========================================
const getExaminerApprovals = async (req, res) => {
    try {
        const { status = "pending", search = "" } = req.query;

        let query = { role: "examiner" };

        if (status && status !== "all") {
            query.approvalStatus = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const examiners = await User.find(query)
            .select("-password")
            .populate("approvedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            examiners
        });
    } catch (error) {
        console.error("Get Examiner Approvals Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/admin/examiners/:id/approval
const updateExaminerApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "approved" | "rejected" | "pending"

        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid approval status. Must be 'approved', 'rejected', or 'pending'."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const examiner = await User.findOne({ _id: id, role: "examiner" });

        if (!examiner) {
            return res.status(404).json({ success: false, message: "Examiner not found" });
        }

        examiner.approvalStatus = status;
        if (status === "approved") {
            examiner.approvedAt = new Date();
            examiner.approvedBy = req.user.id;
        } else if (status === "rejected") {
            examiner.approvedAt = null;
            examiner.approvedBy = req.user.id;
        }

        await examiner.save();

        res.status(200).json({
            success: true,
            message: `Examiner ${examiner.name} has been ${status}.`,
            examiner: {
                id: examiner._id,
                name: examiner.name,
                email: examiner.email,
                role: examiner.role,
                approvalStatus: examiner.approvalStatus,
                approvedAt: examiner.approvedAt
            }
        });
    } catch (error) {
        console.error("Update Examiner Approval Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. User Management (List & Block/Unblock)
// GET /api/admin/users
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        const { role = "all", status = "all", search = "" } = req.query;

        let query = {};

        // Role filter
        if (role && role !== "all") {
            query.role = role;
        } else {
            query.role = { $in: ["examiner", "aspirant", "admin"] };
        }

        // Status filter
        if (status === "blocked") {
            query.isBlocked = true;
        } else if (status === "active") {
            query.isBlocked = false;
            query.approvalStatus = { $ne: "rejected" };
        } else if (status === "pending") {
            query.approvalStatus = "pending";
        } else if (status === "rejected") {
            query.approvalStatus = "rejected";
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .populate("approvedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/admin/users/:id/block
const toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked } = req.body;

        if (typeof isBlocked !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isBlocked must be a boolean (true or false)"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const targetUser = await User.findById(id);

        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Prevent admin from blocking themselves
        if (targetUser._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot block or disable your own Administrator account."
            });
        }

        // Do not allow blocking other admin accounts through normal user management
        if (targetUser.role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Administrator accounts cannot be blocked."
            });
        }

        targetUser.isBlocked = isBlocked;
        await targetUser.save();

        res.status(200).json({
            success: true,
            message: `User ${targetUser.name} has been ${isBlocked ? "blocked" : "unblocked"}.`,
            user: {
                id: targetUser._id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role,
                isBlocked: targetUser.isBlocked,
                approvalStatus: targetUser.approvalStatus
            }
        });
    } catch (error) {
        console.error("Toggle Block User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. Examiner Details & Profile
// GET /api/admin/examiners
// ==========================================
const getAllExaminers = async (req, res) => {
    try {
        const examiners = await User.find({ role: "examiner" })
            .select("-password")
            .sort({ createdAt: -1 });

        const examinerIds = examiners.map(e => e._id);
        const quizCounts = await Quiz.aggregate([
            { $match: { examinerId: { $in: examinerIds } } },
            { $group: { _id: "$examinerId", totalQuizzes: { $sum: 1 }, publishedQuizzes: { $sum: { $cond: ["$isPublished", 1, 0] } } } }
        ]);

        const countMap = {};
        quizCounts.forEach(item => {
            countMap[item._id.toString()] = item;
        });

        const examinersWithStats = examiners.map(examiner => ({
            ...examiner.toObject(),
            totalQuizzes: countMap[examiner._id.toString()]?.totalQuizzes || 0,
            publishedQuizzes: countMap[examiner._id.toString()]?.publishedQuizzes || 0
        }));

        res.status(200).json({
            success: true,
            examiners: examinersWithStats
        });
    } catch (error) {
        console.error("Get Examiners Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/examiners/:id
const getExaminerDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid examiner ID" });
        }

        const examiner = await User.findOne({ _id: id, role: "examiner" })
            .select("-password")
            .populate("approvedBy", "name email");

        if (!examiner) {
            return res.status(404).json({ success: false, message: "Examiner not found" });
        }

        const quizzes = await Quiz.find({ examinerId: examiner._id })
            .sort({ createdAt: -1 });

        const quizIds = quizzes.map(q => q._id);

        const questionCounts = await Question.aggregate([
            { $match: { quizId: { $in: quizIds } } },
            { $group: { _id: "$quizId", count: { $sum: 1 } } }
        ]);
        const questionMap = {};
        questionCounts.forEach(item => {
            questionMap[item._id.toString()] = item.count;
        });

        const attemptStats = await Attempt.aggregate([
            { $match: { quizId: { $in: quizIds } } },
            {
                $group: {
                    _id: "$quizId",
                    totalAttempts: { $sum: 1 },
                    uniqueAspirants: { $addToSet: "$aspirantId" },
                    averageScore: { $avg: "$score" },
                    highestScore: { $max: "$score" },
                    lowestScore: { $min: "$score" },
                    averagePercentage: { $avg: "$percentage" }
                }
            }
        ]);
        const attemptMap = {};
        attemptStats.forEach(item => {
            attemptMap[item._id.toString()] = {
                totalAttempts: item.totalAttempts,
                uniqueAspirantCount: item.uniqueAspirants.length,
                averageScore: Number((item.averageScore || 0).toFixed(2)),
                highestScore: item.highestScore || 0,
                lowestScore: item.lowestScore || 0,
                averagePercentage: Number((item.averagePercentage || 0).toFixed(2))
            };
        });

        const quizzesWithStats = quizzes.map(quiz => {
            const stats = attemptMap[quiz._id.toString()] || {
                totalAttempts: 0,
                uniqueAspirantCount: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                averagePercentage: 0
            };
            return {
                ...quiz.toObject(),
                questionCount: questionMap[quiz._id.toString()] || 0,
                ...stats
            };
        });

        res.status(200).json({
            success: true,
            examiner,
            quizzes: quizzesWithStats
        });
    } catch (error) {
        console.error("Get Examiner Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. Aspirant Details & Examination History
// GET /api/admin/aspirants
// ==========================================
const getAllAspirants = async (req, res) => {
    try {
        const aspirants = await User.find({ role: "aspirant" })
            .select("-password")
            .sort({ createdAt: -1 });

        const aspirantIds = aspirants.map(a => a._id);

        const attemptCounts = await Attempt.aggregate([
            { $match: { aspirantId: { $in: aspirantIds } } },
            {
                $group: {
                    _id: "$aspirantId",
                    totalAttempts: { $sum: 1 },
                    averagePercentage: { $avg: "$percentage" }
                }
            }
        ]);

        const attemptMap = {};
        attemptCounts.forEach(item => {
            attemptMap[item._id.toString()] = {
                totalAttempts: item.totalAttempts,
                averagePercentage: Number((item.averagePercentage || 0).toFixed(2))
            };
        });

        const aspirantsWithStats = aspirants.map(aspirant => ({
            ...aspirant.toObject(),
            totalAttempts: attemptMap[aspirant._id.toString()]?.totalAttempts || 0,
            averagePercentage: attemptMap[aspirant._id.toString()]?.averagePercentage || 0
        }));

        res.status(200).json({
            success: true,
            aspirants: aspirantsWithStats
        });
    } catch (error) {
        console.error("Get Aspirants Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/aspirants/:id
const getAspirantDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid aspirant ID" });
        }

        const aspirant = await User.findOne({ _id: id, role: "aspirant" })
            .select("-password");

        if (!aspirant) {
            return res.status(404).json({ success: false, message: "Aspirant not found" });
        }

        const attempts = await Attempt.find({ aspirantId: aspirant._id })
            .populate("quizId", "title category examinerName communityName timeLimit isPrivate")
            .sort({ createdAt: -1 });

        const formattedAttempts = attempts.map(attempt => {
            const answers = attempt.answers || [];
            const correctAnswersCount = answers.filter(a => a.isCorrect).length;
            const incorrectAnswersCount = answers.filter(a => a.isCorrect === false && a.selectedAnswer).length;
            const unansweredCount = answers.filter(a => !a.selectedAnswer).length;

            return {
                _id: attempt._id,
                quizId: attempt.quizId?._id || null,
                quizTitle: attempt.quizId?.title || "Deleted Quiz",
                category: attempt.quizId?.category || "General Knowledge",
                examinerName: attempt.quizId?.examinerName || "Unknown",
                communityName: attempt.quizId?.communityName || "",
                isCommunityQuiz: Boolean(attempt.quizId?.communityName),
                attemptDate: attempt.createdAt,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                percentage: Number((attempt.percentage || 0).toFixed(2)),
                resultStatus: attempt.percentage >= 40 ? "PASS" : "FAIL",
                totalQuestions: answers.length,
                correctAnswersCount,
                incorrectAnswersCount,
                unansweredCount,
                quizVersion: attempt.quizVersion || 1
            };
        });

        res.status(200).json({
            success: true,
            aspirant,
            attempts: formattedAttempts
        });
    } catch (error) {
        console.error("Get Aspirant Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 6. Quiz Management & Details
// GET /api/admin/quizzes
// ==========================================
const getAllQuizzes = async (req, res) => {
    try {
        const { search = "", status = "all", category = "all" } = req.query;

        let query = {};

        if (status === "published") {
            query.isPublished = true;
        } else if (status === "draft") {
            query.isPublished = false;
        }

        if (category && category !== "all") {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { examinerName: { $regex: search, $options: "i" } },
                { quizCode: { $regex: search, $options: "i" } }
            ];
        }

        const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
        const quizIds = quizzes.map(q => q._id);

        const questionCounts = await Question.aggregate([
            { $match: { quizId: { $in: quizIds } } },
            { $group: { _id: "$quizId", count: { $sum: 1 } } }
        ]);
        const questionMap = {};
        questionCounts.forEach(item => {
            questionMap[item._id.toString()] = item.count;
        });

        const attemptCounts = await Attempt.aggregate([
            { $match: { quizId: { $in: quizIds } } },
            { $group: { _id: "$quizId", totalAttempts: { $sum: 1 }, averagePercentage: { $avg: "$percentage" } } }
        ]);
        const attemptMap = {};
        attemptCounts.forEach(item => {
            attemptMap[item._id.toString()] = {
                totalAttempts: item.totalAttempts,
                averagePercentage: Number((item.averagePercentage || 0).toFixed(2))
            };
        });

        const quizzesWithDetails = quizzes.map(quiz => ({
            ...quiz.toObject(),
            questionCount: questionMap[quiz._id.toString()] || 0,
            totalAttempts: attemptMap[quiz._id.toString()]?.totalAttempts || 0,
            averagePercentage: attemptMap[quiz._id.toString()]?.averagePercentage || 0
        }));

        res.status(200).json({
            success: true,
            quizzes: quizzesWithDetails
        });
    } catch (error) {
        console.error("Get All Quizzes Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/quizzes/:id
const getQuizFullDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid quiz ID" });
        }

        const quiz = await Quiz.findById(id).populate("examinerId", "name email");

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        const questions = await Question.find({ quizId: quiz._id }).sort({ createdAt: 1 });

        const attempts = await Attempt.find({ quizId: quiz._id })
            .populate("aspirantId", "name email")
            .sort({ createdAt: -1 });

        const formattedAttempts = attempts.map(attempt => ({
            _id: attempt._id,
            aspirantId: attempt.aspirantId?._id,
            aspirantName: attempt.aspirantId?.name || "Deleted User",
            aspirantEmail: attempt.aspirantId?.email || "N/A",
            score: attempt.score,
            totalMarks: attempt.totalMarks,
            percentage: Number((attempt.percentage || 0).toFixed(2)),
            resultStatus: attempt.percentage >= 40 ? "PASS" : "FAIL",
            attemptDate: attempt.createdAt,
            totalAnswers: attempt.answers?.length || 0
        }));

        res.status(200).json({
            success: true,
            quiz,
            questions,
            attempts: formattedAttempts
        });
    } catch (error) {
        console.error("Get Quiz Full Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. Attempt Breakdown & Details
// GET /api/admin/attempts/:id
// ==========================================
const getAttemptFullDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid attempt ID" });
        }

        const attempt = await Attempt.findById(id)
            .populate("aspirantId", "name email")
            .populate("quizId", "title category examinerName timeLimit");

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Attempt not found" });
        }

        const questionIds = (attempt.answers || []).map(a => a.questionId).filter(Boolean);
        const questions = await Question.find({ _id: { $in: questionIds } });
        const questionMap = {};
        questions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        const breakdown = (attempt.answers || []).map(ans => {
            const q = ans.questionId ? questionMap[ans.questionId.toString()] : null;
            return {
                questionId: ans.questionId,
                questionText: q ? q.question : "Question Deleted",
                options: q ? q.options : [],
                correctAnswer: q ? q.correctAnswer : "N/A",
                selectedAnswer: ans.selectedAnswer || "No Answer",
                isCorrect: ans.isCorrect,
                marks: q ? q.marks : 1
            };
        });

        res.status(200).json({
            success: true,
            attempt: {
                _id: attempt._id,
                quiz: attempt.quizId,
                aspirant: attempt.aspirantId,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                percentage: Number((attempt.percentage || 0).toFixed(2)),
                resultStatus: attempt.percentage >= 40 ? "PASS" : "FAIL",
                attemptDate: attempt.createdAt,
                breakdown
            }
        });
    } catch (error) {
        console.error("Get Attempt Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 8. Admin Community Management
// GET /api/admin/communities
// ==========================================
const getAllAdminCommunities = async (req, res) => {
    try {
        const { search = "", visibility = "all", category = "all", sort = "desc" } = req.query;

        let query = {};

        if (visibility && visibility !== "all") {
            query.visibility = visibility;
        }

        if (category && category !== "all") {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { communityCode: { $regex: search, $options: "i" } },
                { ownerName: { $regex: search, $options: "i" } }
            ];
        }

        const sortOrder = sort === "asc" ? 1 : -1;
        const communities = await Community.find(query)
            .populate("ownerId", "name email role isBlocked approvalStatus createdAt")
            .sort({ createdAt: sortOrder });

        const communityIds = communities.map(c => c._id);

        // Aggregate actual member counts from CommunityMember collection
        const memberCounts = await CommunityMember.aggregate([
            { $match: { communityId: { $in: communityIds } } },
            { $group: { _id: "$communityId", count: { $sum: 1 } } }
        ]);
        const memberCountMap = {};
        memberCounts.forEach(m => {
            memberCountMap[m._id.toString()] = m.count;
        });

        // Aggregate actual quiz counts from Quiz collection
        const quizCounts = await Quiz.aggregate([
            { $match: { communityId: { $in: communityIds } } },
            { $group: { _id: "$communityId", count: { $sum: 1 } } }
        ]);
        const quizCountMap = {};
        quizCounts.forEach(q => {
            quizCountMap[q._id.toString()] = q.count;
        });

        const formattedCommunities = communities.map(comm => {
            const commObj = comm.toObject();
            return {
                ...commObj,
                totalMembers: memberCountMap[comm._id.toString()] || commObj.totalMembers || 1,
                totalQuizzes: quizCountMap[comm._id.toString()] || commObj.totalQuizzes || 0,
                ownerEmail: commObj.ownerId?.email || "N/A"
            };
        });

        res.status(200).json({
            success: true,
            communities: formattedCommunities
        });
    } catch (error) {
        console.error("Get All Communities Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/communities/:id
const getAdminCommunityDetails = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid community ID" });
        }

        const community = await Community.findById(id);

        if (!community) {
            return res.status(404).json({ success: false, message: "Community not found" });
        }

        // 1. Fetch actual owner information from User model
        const owner = await User.findById(community.ownerId)
            .select("-password");

        // 2. Fetch all members from CommunityMember collection and populate user details
        const memberRecords = await CommunityMember.find({ communityId: community._id })
            .populate("examinerId", "name email role isBlocked approvalStatus createdAt")
            .sort({ createdAt: 1 });

        // Map and format members
        const formattedMembers = memberRecords.map(m => {
            const user = m.examinerId;
            const isOwner = community.ownerId.toString() === (user?._id?.toString() || m.examinerId?.toString());
            return {
                _id: m._id,
                userId: user?._id || m.examinerId,
                name: user?.name || m.examinerName || "Unknown Member",
                email: user?.email || "N/A",
                role: isOwner ? "Owner" : (user?.role === "aspirant" ? "Aspirant" : (user?.role === "examiner" ? "Examiner" : m.role || "Member")),
                joinedAt: m.joinedAt || m.createdAt,
                isBlocked: user ? user.isBlocked : false,
                approvalStatus: user ? user.approvalStatus : "approved",
                isOwner
            };
        });

        // 3. Fetch all quizzes associated with this community using communityId
        const quizzes = await Quiz.find({ communityId: community._id })
            .sort({ createdAt: -1 });

        const quizIds = quizzes.map(q => q._id);

        // Aggregate question counts for these quizzes
        const questionCounts = await Question.aggregate([
            { $match: { quizId: { $in: quizIds } } },
            { $group: { _id: "$quizId", count: { $sum: 1 } } }
        ]);
        const questionMap = {};
        questionCounts.forEach(item => {
            questionMap[item._id.toString()] = item.count;
        });

        // Aggregate attempt stats for these quizzes
        const attemptStats = await Attempt.aggregate([
            { $match: { quizId: { $in: quizIds } } },
            {
                $group: {
                    _id: "$quizId",
                    totalAttempts: { $sum: 1 },
                    uniqueAspirants: { $addToSet: "$aspirantId" },
                    averageScore: { $avg: "$score" },
                    averagePercentage: { $avg: "$percentage" }
                }
            }
        ]);
        const attemptMap = {};
        let totalCommunityAttempts = 0;

        attemptStats.forEach(item => {
            totalCommunityAttempts += item.totalAttempts;
            attemptMap[item._id.toString()] = {
                totalAttempts: item.totalAttempts,
                uniqueAspirantsCount: item.uniqueAspirants.length,
                averageScore: Number((item.averageScore || 0).toFixed(2)),
                averagePercentage: Number((item.averagePercentage || 0).toFixed(2))
            };
        });

        const formattedQuizzes = quizzes.map(quiz => {
            const stats = attemptMap[quiz._id.toString()] || {
                totalAttempts: 0,
                uniqueAspirantsCount: 0,
                averageScore: 0,
                averagePercentage: 0
            };
            return {
                ...quiz.toObject(),
                questionCount: questionMap[quiz._id.toString()] || 0,
                ...stats
            };
        });

        // 4. Calculate Community Statistics
        const examinersJoined = formattedMembers.filter(m => m.role === "Examiner" || (m.isOwner && owner?.role === "examiner")).length;
        const aspirantsJoined = formattedMembers.filter(m => m.role === "Aspirant").length;

        const statistics = {
            totalMembers: formattedMembers.length,
            totalExaminers: examinersJoined,
            totalAspirants: aspirantsJoined,
            totalQuizzes: formattedQuizzes.length,
            totalQuizAttempts: totalCommunityAttempts
        };

        res.status(200).json({
            success: true,
            community,
            owner: owner || {
                _id: community.ownerId,
                name: community.ownerName,
                email: "N/A",
                role: "examiner",
                isBlocked: false,
                approvalStatus: "approved"
            },
            statistics,
            members: formattedMembers,
            quizzes: formattedQuizzes
        });
    } catch (error) {
        console.error("Get Community Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 9. Admin Profile & Password Update
// GET /api/admin/profile
// ==========================================
const getAdminProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "Administrator account not found." });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Get Admin Profile Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/profile/password
const updateAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password, new password, and confirmation are all required."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match."
            });
        }

        if (newPassword === currentPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from your current password."
            });
        }

        // Password policy: At least 12 chars, uppercase, lowercase, number, and special character
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,./~`|\\])[A-Za-z\d@$!%*?&#^()_\-+={}[\]:;"'<>,./~`|\\]{12,}$/;

        if (!passwordPolicy.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        // Find authenticated Admin
        const adminUser = await User.findById(req.user.id);

        if (!adminUser || adminUser.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Admin privileges required."
            });
        }

        // Verify current password against database hash
        const isMatch = await bcrypt.compare(currentPassword, adminUser.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        adminUser.password = hashedPassword;
        await adminUser.save();

        res.status(200).json({
            success: true,
            message: "Administrator password updated successfully."
        });
    } catch (error) {
        console.error("Update Admin Password Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getExaminerApprovals,
    updateExaminerApproval,
    getAllUsers,
    toggleBlockUser,
    getAllExaminers,
    getExaminerDetails,
    getAllAspirants,
    getAspirantDetails,
    getAllQuizzes,
    getQuizFullDetails,
    getAttemptFullDetails,
    getAllAdminCommunities,
    getAdminCommunityDetails,
    getAdminProfile,
    updateAdminPassword
};
