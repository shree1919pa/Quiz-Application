const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

/*
=========================================================
Get Student Community Quizzes
GET /api/student/community-quizzes
=========================================================
*/
const getStudentCommunityQuizzes = async (req, res) => {
    try {
        const studentId = req.user.id;

        // 1. Find all communities where the student is a member
        const memberships = await CommunityMember.find({
            examinerId: studentId
        }).lean();

        if (!memberships || memberships.length === 0) {
            return res.status(200).json({
                success: true,
                joinedCommunitiesCount: 0,
                totalQuizzes: 0,
                communities: [],
                quizzes: []
            });
        }

        const joinedCommunityIds = memberships.map(m => m.communityId);

        // 2. Fetch community details
        const communities = await Community.find({
            _id: { $in: joinedCommunityIds },
            isActive: true
        }).lean();

        // 3. Fetch published quizzes belonging ONLY to these joined communities
        const quizzes = await Quiz.find({
            communityId: { $in: joinedCommunityIds },
            isPublished: true
        })
        .sort({ createdAt: -1 })
        .lean();

        // 4. Enhance quiz data with total questions and metadata
        const enhancedQuizzes = await Promise.all(
            quizzes.map(async (quiz) => {
                const totalQuestions = await Question.countDocuments({
                    quizId: quiz._id
                });

                // Find matching community name if not present
                const matchedCommunity = communities.find(
                    c => c._id.toString() === quiz.communityId?.toString()
                );

                return {
                    ...quiz,
                    communityName: quiz.communityName || matchedCommunity?.name || "Community",
                    communityCategory: matchedCommunity?.category || "General",
                    totalQuestions
                };
            })
        );

        return res.status(200).json({
            success: true,
            joinedCommunitiesCount: communities.length,
            totalQuizzes: enhancedQuizzes.length,
            communities,
            quizzes: enhancedQuizzes
        });

    } catch (error) {
        console.error("Get Student Community Quizzes Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getStudentCommunityQuizzes
};
