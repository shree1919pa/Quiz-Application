const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "./backend/.env" });

const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const { seedAdminAndMigrate } = require("../config/adminSeeder");

async function runTests() {
    console.log("=== Starting Admin Module Verification Tests ===");
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quiz_db");
        console.log("Connected to MongoDB.");

        // 1. Run seeder
        await seedAdminAndMigrate();

        // 2. Verify admin account exists in DB
        const admin = await User.findOne({ email: "admin17@gmail.com" });
        if (!admin) {
            throw new Error("Admin user not found in database!");
        }
        console.log("Admin account found in DB:", {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            approvalStatus: admin.approvalStatus,
            isBlocked: admin.isBlocked
        });

        // 3. Verify admin password match
        const isMatch = await bcrypt.compare("Admin@1905", admin.password);
        if (!isMatch) {
            throw new Error("Admin password comparison failed!");
        }
        console.log("Admin password verified successfully.");

        // 4. Test Examiner registration approval status
        const testExaminerEmail = "test_examiner_demo@test.com";
        await User.deleteOne({ email: testExaminerEmail });

        const newExaminer = await User.create({
            name: "Test Examiner",
            email: testExaminerEmail,
            password: await bcrypt.hash("Password@123", 10),
            role: "examiner",
            approvalStatus: "pending",
            isBlocked: false
        });

        console.log("New examiner created with pending status:", newExaminer.approvalStatus);

        // 5. Test stats query
        const totalExaminers = await User.countDocuments({ role: "examiner" });
        const pendingApprovals = await User.countDocuments({ role: "examiner", approvalStatus: "pending" });
        const totalAspirants = await User.countDocuments({ role: "aspirant" });
        const totalQuizzes = await Quiz.countDocuments();
        const totalAttempts = await Attempt.countDocuments();

        console.log("Database Stats Test:", {
            totalExaminers,
            pendingApprovals,
            totalAspirants,
            totalQuizzes,
            totalAttempts
        });

        // Clean up test examiner
        await User.deleteOne({ email: testExaminerEmail });

        console.log("=== All Backend Verification Checks Passed Successfully! ===");
    } catch (err) {
        console.error("Test Failure:", err);
    } finally {
        await mongoose.disconnect();
    }
}

runTests();
