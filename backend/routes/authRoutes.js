const express = require("express");

const router = express.Router();

const {
    registerAspirant,
    registerExaminer,
    loginAspirant,
    loginExaminer,
    loginAdmin
} = require("../controllers/authController");

router.post(
    "/register/aspirant",
    registerAspirant
);

router.post(
    "/register/examiner",
    registerExaminer
);

router.post(
    "/login/aspirant",
    loginAspirant
);

router.post(
    "/login/examiner",
    loginExaminer
);

router.post(
    "/login/admin",
    loginAdmin
);

module.exports = router;