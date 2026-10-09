const bcrypt = require("bcryptjs");
const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const User = require("../models/User");

const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");

/*
=========================================================
Generate Community Code
=========================================================
*/

const generateCommunityCode = () => {

    const random = Math.floor(
        1000 + Math.random() * 9000
    );

    return `COM-${random}`;

};

/*
=========================================================
Create Community
POST /api/community/create
=========================================================
*/

const createCommunity = async (req, res) => {

    try {

        const {
            name,
            description,
            category,
            visibility,
            password
        } = req.body;

        if (!name) {

            return res.status(400).json({
                message: "Community name is required."
            });

        }

        if (
            visibility === "private" &&
            !password
        ) {

            return res.status(400).json({
                message: "Password is required for private community."
            });

        }

        let hashedPassword = null;

        if (visibility === "private") {

            hashedPassword = await bcrypt.hash(
                password,
                10
            );

        }

        let communityCode;

        let exists = true;

        while (exists) {

            communityCode = generateCommunityCode();

            exists = await Community.findOne({
                communityCode
            });

        }

        const community = await Community.create({

            name,

            description,

            category,

            visibility,

            password: hashedPassword,

            communityCode,

            ownerId: req.user.id,

            ownerName: req.user.name

        });

        await CommunityMember.create({

            communityId: community._id,

            examinerId: req.user.id,

            examinerName: req.user.name,

            role: "owner"

        });

        res.status(201).json({

            success: true,

            message: "Community created successfully.",

            community

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};



/*
=========================================================
Get All Communities
GET /api/community
=========================================================
*/

const getAllCommunities = async (req, res) => {

    try {

        const communities = await Community.find({

            isActive: true

        })

            .sort({

                createdAt: -1

            });

        res.status(200).json({

            success: true,

            communities

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================================
Get My Communities
GET /api/community/my
=========================================================
*/

const getMyCommunities = async (req, res) => {

    try {

        const memberships = await CommunityMember.find({

            examinerId: req.user.id

        });

        const ids = memberships.map(

            member => member.communityId

        );

        const communities = await Community.find({

            _id: {

                $in: ids

            }

        });

        res.status(200).json({

            success: true,

            communities

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================================
Get Community Details
GET /api/community/:id
=========================================================
*/

const getCommunityDetails = async (req, res) => {

    try {

        const community = await Community.findById(req.params.id);

        if (!community) {

            return res.status(404).json({

                success: false,

                message: "Community not found."

            });

        }

        // Community Members
        const members = await CommunityMember.find({

            communityId: community._id

        });

        // Current Examiner Membership
        const myMembership = await CommunityMember.findOne({

            communityId: community._id,

            examinerId: req.user.id

        });

        // ===============================
        // Community Statistics
        // ===============================

        // Total Quizzes
        const totalQuizzes = await Quiz.countDocuments({

            communityId: community._id

        });

        // Published Quizzes
        const publishedQuizzes = await Quiz.countDocuments({

            communityId: community._id,

            isPublished: true

        });

        // Draft Quizzes
        const draftQuizzes = await Quiz.countDocuments({

            communityId: community._id,

            isPublished: false

        });

        // Get Quiz IDs
        const quizzes = await Quiz.find({

            communityId: community._id

        }).select("_id");

        const quizIds = quizzes.map(

            quiz => quiz._id

        );

        // Total Attempts
        const totalAttempts = await Attempt.countDocuments({

            quizId: {

                $in: quizIds

            }

        });

        // Average Community Score
        const attempts = await Attempt.find({

            quizId: {

                $in: quizIds

            }

        }).select("percentage");

        let averageScore = 0;

        if (attempts.length > 0) {

            const totalPercentage = attempts.reduce(

                (sum, item) => sum + item.percentage,

                0

            );

            averageScore = Number(

                (

                    totalPercentage /

                    attempts.length

                ).toFixed(1)

            );

        }

        const statistics = {

            totalQuizzes,

            totalMembers: members.length,

            publishedQuizzes,

            draftQuizzes,

            totalAttempts,

            averageScore

        };

        return res.status(200).json({

            success: true,

            community,

            members,

            myMembership,

            statistics

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

/*
=========================================================
Join Community
POST /api/community/join
=========================================================
*/

const joinCommunity = async (req, res) => {

    try {

        const {
            communityCode,
            communityId,
            password
        } = req.body;

        let community = null;

        if (communityId) {
            community = await Community.findById(communityId);
        } else if (communityCode) {
            community = await Community.findOne({
                communityCode: typeof communityCode === "string" ? communityCode.trim() : communityCode
            });
        }

        if (!community) {

            return res.status(404).json({
                success: false,
                message: "Community not found."
            });

        }

        const alreadyJoined = await CommunityMember.findOne({

            communityId: community._id,

            examinerId: req.user.id

        });

        if (alreadyJoined) {

            return res.status(400).json({
                success: false,
                message: "Already joined."
            });

        }

        if (
            community.visibility === "private"
        ) {
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required for private community."
                });
            }

            const match = await bcrypt.compare(
                password,
                community.password
            );

            if (!match) {

                return res.status(400).json({
                    success: false,
                    message: "Incorrect password."
                });

            }

        }

        await CommunityMember.create({

            communityId: community._id,

            examinerId: req.user.id,

            examinerName: req.user.name || req.user.fullName || "User",

            role: req.user.role === "examiner" ? "contributor" : "student"

        });

        community.totalMembers += 1;

        await community.save();

        res.status(200).json({

            success: true,

            message: "Joined community successfully.",

            community

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/*
=========================================================
Delete Community
DELETE /api/community/:id
=========================================================
*/

const deleteCommunity = async (req, res) => {

    try {

        const community = await Community.findById(

            req.params.id

        );

        if (!community) {

            return res.status(404).json({

                message: "Community not found."

            });

        }

        if (

            community.ownerId.toString() !== req.user.id

        ) {

            return res.status(403).json({

                message: "Only owner can delete community."

            });

        }

        await Community.findByIdAndDelete(

            community._id

        );

        await CommunityMember.deleteMany({

            communityId: community._id

        });

        res.status(200).json({

            success: true,

            message: "Community deleted."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


const getCommunityQuizzes = async (req, res) => {

    try {

        const { communityId } = req.params;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({
                success: false,
                message: "Community not found."
            });
        }

        // Security check: Must be a member or the owner
        const isMember = await CommunityMember.findOne({
            communityId: community._id,
            examinerId: req.user.id
        });

        if (!isMember && community.ownerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You must be a member of this community to view its quizzes."
            });
        }

        const quizzes = await Quiz.find({
            communityId,
            ...(req.user.role === "aspirant" ? { isPublished: true } : {})
        })
            .sort({
                createdAt: -1
            })
            .lean();

        for (const quiz of quizzes) {

            // Total Questions
            const totalQuestions = await Question.countDocuments({
                quizId: quiz._id
            });

            // Attempts
            const attempts = await Attempt.find({
                quizId: quiz._id
            });

            const totalAttempts = attempts.length;

            // Average Percentage
            let averageScore = 0;

            if (totalAttempts > 0) {

                const totalPercentage = attempts.reduce(

                    (sum, attempt) => sum + attempt.percentage,

                    0

                );

                averageScore = (
                    totalPercentage / totalAttempts
                ).toFixed(1);

            }

            quiz.totalQuestions = totalQuestions;
            quiz.totalAttempts = totalAttempts;
            quiz.averageScore = averageScore;

        }

        return res.status(200).json({

            success: true,

            quizzes

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

const discoverCommunities = async (req, res) => {

    try {

        const userId = req.user.id;
        const userRole = req.user.role;

        const joinedCommunities = await CommunityMember.find({
            examinerId: userId
        }).select("communityId");

        const joinedIds = joinedCommunities.map(
            item => item.communityId.toString()
        );

        let query = {
            isActive: true
        };

        let studentInterests = [];

        // If user is a student/aspirant, filter communities by their selected interests
        if (userRole === "aspirant") {
            const user = await User.findById(userId);
            studentInterests = user?.interests || [];

            if (studentInterests.length === 0) {
                return res.status(200).json({
                    success: true,
                    communities: [],
                    joinedCommunityIds: joinedIds,
                    studentInterests: [],
                    requiresInterests: true,
                    message: "Select your interests to discover relevant communities."
                });
            }

            const interestRegexes = studentInterests.map(
                i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")
            );

            query.category = { $in: interestRegexes };
        } else {
            // Examiner: show unjoined communities
            query._id = { $nin: joinedIds };
        }

        const communities = await Community.find(query).sort({
            createdAt: -1
        }).lean();

        // Enhance communities with isJoined boolean
        const enhancedCommunities = communities.map(c => ({
            ...c,
            isJoined: joinedIds.includes(c._id.toString())
        }));

        res.status(200).json({
            success: true,
            communities: enhancedCommunities,
            joinedCommunityIds: joinedIds,
            studentInterests,
            requiresInterests: false
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateCommunity = async (req, res) => {

    try {

        const { id } = req.params;

        const {

            name,

            description,

            category,

            visibility,

            password

        } = req.body;

        const community = await Community.findById(id);

        if (!community) {

            return res.status(404).json({

                success: false,

                message: "Community not found."

            });

        }

        // Only owner can update

        if (

            community.ownerId.toString() !== req.user.id

        ) {

            return res.status(403).json({

                success: false,

                message: "Only owner can update this community."

            });

        }

        community.name = name;

        community.description = description;

        community.category = category;

        community.visibility = visibility;

        if (visibility === "private") {

            community.password = password;

        } else {

            community.password = "";

        }

        await community.save();

        return res.status(200).json({

            success: true,

            message: "Community updated successfully.",

            community

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

const getCommunityMembers = async (req, res) => {

    try {

        const { communityId } = req.params;

        // Check community exists
        const community = await Community.findById(communityId);

        if (!community) {

            return res.status(404).json({

                success: false,

                message: "Community not found."

            });

        }

        // Get all members with examiner details
        const members = await CommunityMember.find({

            communityId

        })
        .populate(

            "examinerId",

            "fullName name email"

        )
        .sort({

            role: 1,

            createdAt: 1

        });

        // Format response
        const formattedMembers = members.map(member => ({

            _id: member._id,

            examinerId: member.examinerId?._id,

            examinerName:

                member.examinerId?.fullName ||

                member.examinerId?.name ||

                "Unknown Examiner",

            examinerEmail:

                member.examinerId?.email ||

                "",

            role: member.role,

            joinedAt: member.createdAt

        }));

        // Current logged-in user's membership
        const myMembership = await CommunityMember.findOne({

            communityId,

            examinerId: req.user.id

        });

        return res.status(200).json({

            success: true,

            community,

            members: formattedMembers,

            myMembership

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
module.exports = {

    createCommunity,

    getAllCommunities,

    getMyCommunities,

    getCommunityDetails,

    joinCommunity,

    deleteCommunity,

    getCommunityQuizzes,

    discoverCommunities,

    updateCommunity,

    getCommunityMembers,

    

};