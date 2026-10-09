const express = require("express");
const router = express.Router();

const {
    getProfile,
    changePassword,
    updateInterests
} = require("../controllers/profileController");

const {
    verifyToken
} = require("../middleware/authMiddleware");

/*
=========================================
PROFILE
=========================================
*/

// Get logged-in user profile
router.get(
    "/",
    verifyToken,
    getProfile
);

// Change password
router.put(
    "/password",
    verifyToken,
    changePassword
);

// Update student interests
router.put(
    "/interests",
    verifyToken,
    updateInterests
);

module.exports = router;
