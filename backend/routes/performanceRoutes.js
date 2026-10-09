const express = require("express");

const router = express.Router();

const {
    getMyPerformance,
    getPerformanceDetails
} = require("../controllers/performanceController");

const {
    verifyToken,
    requireRole
} = require("../middleware/authMiddleware");

/*
========================================================
MY PERFORMANCE
========================================================
*/

// Get all performance records
router.get(
    "/",
    verifyToken,
    requireRole("aspirant"),
    getMyPerformance
);

// Get one quiz performance details
router.get(
    "/:attemptId",
    verifyToken,
    requireRole("aspirant"),
    getPerformanceDetails
);

module.exports = router;