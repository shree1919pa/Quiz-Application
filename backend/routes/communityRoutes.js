const express = require("express");

const router = express.Router();

const {
    createCommunity,
    getAllCommunities,
    getMyCommunities,
    getCommunityDetails,
    joinCommunity,
    deleteCommunity,
    getCommunityQuizzes,
    discoverCommunities,
    updateCommunity,
    getCommunityMembers
} = require("../controllers/communityController");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

/*
=========================================================
Create Community
=========================================================
*/

router.post(
    "/create",
    verifyToken,
    authorizeRole("examiner"),
    createCommunity
);

/*
=========================================================
Join Community
=========================================================
*/

router.post(
    "/join",
    verifyToken,
    joinCommunity
);

/*
=========================================================
Get All Communities
=========================================================
*/

router.get(
    "/",
    verifyToken,
    getAllCommunities
);

/*
=========================================================
Get My Communities
=========================================================
*/

router.get(
    "/my",
    verifyToken,
    getMyCommunities
);

/*
=========================================================
Discover Communities
=========================================================
*/

router.get(
    "/discover",
    verifyToken,
    discoverCommunities
);


router.get(

    "/:communityId/members",

    verifyToken,

    authorizeRole("examiner"),

    getCommunityMembers

);

/*
=========================================================
Community Quizzes
=========================================================
*/

router.get(
    "/:communityId/quizzes",
    verifyToken,
    getCommunityQuizzes
);


router.put(

    "/:id",

    verifyToken,

    authorizeRole("examiner"),

    updateCommunity

);

/*
=========================================================
Community Details
=========================================================
*/

router.get(
    "/:id",
    verifyToken,
    getCommunityDetails
);

/*
=========================================================
Delete Community
=========================================================
*/

router.delete(
    "/:id",
    verifyToken,
    authorizeRole("examiner"),
    deleteCommunity
);

module.exports = router;