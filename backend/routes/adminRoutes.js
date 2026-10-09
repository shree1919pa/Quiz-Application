const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/adminController");

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

// All admin routes require valid token and admin role
router.use(verifyToken, adminOnly);

// 1. Dashboard
router.get("/stats", getDashboardStats);

// 2. Examiner Approvals
router.get("/examiners/approvals", getExaminerApprovals);
router.patch("/examiners/:id/approval", updateExaminerApproval);

// 3. User Management
router.get("/users", getAllUsers);
router.patch("/users/:id/block", toggleBlockUser);

// 4. Examiners
router.get("/examiners", getAllExaminers);
router.get("/examiners/:id", getExaminerDetails);

// 5. Aspirants
router.get("/aspirants", getAllAspirants);
router.get("/aspirants/:id", getAspirantDetails);

// 6. Quizzes
router.get("/quizzes", getAllQuizzes);
router.get("/quizzes/:id", getQuizFullDetails);

// 7. Attempts
router.get("/attempts/:id", getAttemptFullDetails);

// 8. Community Management
router.get("/communities", getAllAdminCommunities);
router.get("/communities/:id", getAdminCommunityDetails);

// 9. Admin Profile & Password Update
router.get("/profile", getAdminProfile);
router.put("/profile/password", updateAdminPassword);

module.exports = router;
