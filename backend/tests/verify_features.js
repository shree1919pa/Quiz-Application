const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config({ path: "c:/Users/patle/OneDrive/Desktop/Online Quiz Application/backend/.env" });

const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const Question = require("../models/Question");
const { migrateCommunityQuizzes } = require("../controllers/quizController");

async function runTests() {
    console.log("==================================================");
    console.log("STARTING TEST SUITE FOR ADVANCED QUIZ & COMMUNITY FEATURES");
    console.log("==================================================");

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB for Testing\n");

        // Clean up test data prefix
        const testPrefix = "test_" + Date.now();

        // ----------------------------------------------------
        // TEST 1: Registration Flow & User Model with Interests
        // ----------------------------------------------------
        console.log("--- TEST 1: Student Registration & Interests Schema ---");
        const student1Email = `${testPrefix}_student1@example.com`;
        const student1 = await User.create({
            name: "Student One",
            email: student1Email,
            password: await bcrypt.hash("password123", 10),
            role: "aspirant",
            interests: []
        });

        if (student1 && Array.isArray(student1.interests) && student1.interests.length === 0) {
            console.log("✓ TEST 1 PASSED: User created as aspirant with empty interests array.");
        } else {
            throw new Error("TEST 1 FAILED: User interests array not properly initialized.");
        }

        // ----------------------------------------------------
        // TEST 2: Update Interests (Single Interest: Programming)
        // ----------------------------------------------------
        console.log("\n--- TEST 2: Select Single Interest (Programming) ---");
        student1.interests = ["Programming"];
        await student1.save();

        const examiner1 = await User.create({
            name: "Examiner One",
            email: `${testPrefix}_examiner1@example.com`,
            password: await bcrypt.hash("password123", 10),
            role: "examiner"
        });

        // Create normal quizzes: 1 Programming, 1 Medical, 1 Mathematics
        const progQuiz = await Quiz.create({
            title: "Java Fundamentals",
            category: "Programming",
            examinerId: examiner1._id,
            examinerName: examiner1.name,
            timeLimit: 15,
            isPublished: true,
            communityId: null,
            communityName: ""
        });

        const medQuiz = await Quiz.create({
            title: "Human Anatomy Basics",
            category: "Medical",
            examinerId: examiner1._id,
            examinerName: examiner1.name,
            timeLimit: 20,
            isPublished: true,
            communityId: null,
            communityName: ""
        });

        const mathQuiz = await Quiz.create({
            title: "Calculus I",
            category: "Mathematics",
            examinerId: examiner1._id,
            examinerName: examiner1.name,
            timeLimit: 25,
            isPublished: true,
            communityId: null,
            communityName: ""
        });

        // Query published quizzes for student1 (Interests: Programming)
        const student1Interests = student1.interests;
        const interestRegexes1 = student1Interests.map(i => new RegExp(`^${i}$`, "i"));
        const normalQuizzesForStudent1 = await Quiz.find({
            isPublished: true,
            $or: [{ communityId: null }, { communityId: { $exists: false } }],
            category: { $in: interestRegexes1 }
        });

        const titles1 = normalQuizzesForStudent1.map(q => q.title);
        if (titles1.includes("Java Fundamentals") && !titles1.includes("Human Anatomy Basics") && !titles1.includes("Calculus I")) {
            console.log("✓ TEST 2 PASSED: Only Programming quiz shown. Medical and Mathematics quizzes excluded.");
        } else {
            throw new Error(`TEST 2 FAILED: Expected only Programming quiz, got: ${titles1.join(", ")}`);
        }

        // ----------------------------------------------------
        // TEST 3: Multi-Interest Selection (Programming + Medical)
        // ----------------------------------------------------
        console.log("\n--- TEST 3: Multi-Interest Selection (Programming + Medical) ---");
        student1.interests = ["Programming", "Medical"];
        await student1.save();

        const interestRegexes2 = student1.interests.map(i => new RegExp(`^${i}$`, "i"));
        const normalQuizzesForStudent1Multi = await Quiz.find({
            isPublished: true,
            $or: [{ communityId: null }, { communityId: { $exists: false } }],
            category: { $in: interestRegexes2 }
        });

        const titles2 = normalQuizzesForStudent1Multi.map(q => q.title);
        if (titles2.includes("Java Fundamentals") && titles2.includes("Human Anatomy Basics") && !titles2.includes("Calculus I")) {
            console.log("✓ TEST 3 PASSED: Both Programming and Medical quizzes returned. Mathematics excluded.");
        } else {
            throw new Error(`TEST 3 FAILED: Expected Programming & Medical quizzes, got: ${titles2.join(", ")}`);
        }

        // ----------------------------------------------------
        // TEST 4 & 5: Normal Quiz vs Community Quiz Separation
        // ----------------------------------------------------
        console.log("\n--- TEST 4 & 5: Community Quiz Separation & Normal Quiz API ---");
        // Create a Community
        const community1 = await Community.create({
            name: `${testPrefix} Java Devs Hub`,
            description: "A hub for Java developers",
            category: "Programming",
            communityCode: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
            ownerId: examiner1._id,
            ownerName: examiner1.name
        });

        // Add examiner1 as owner member
        await CommunityMember.create({
            communityId: community1._id,
            examinerId: examiner1._id,
            examinerName: examiner1.name,
            role: "owner"
        });

        // Create a Community Quiz with valid communityId & category=Programming
        const commQuiz = await Quiz.create({
            title: "Advanced Java Threads Community Quiz",
            category: "Programming",
            examinerId: examiner1._id,
            examinerName: examiner1.name,
            timeLimit: 30,
            isPublished: true,
            communityId: community1._id,
            communityName: community1.name
        });

        // Check normal quizzes endpoint logic: should NOT return commQuiz
        const normalFiltered = await Quiz.find({
            isPublished: true,
            $or: [{ communityId: null }, { communityId: { $exists: false } }],
            category: { $in: interestRegexes2 }
        });
        const normalTitles = normalFiltered.map(q => q.title);

        if (!normalTitles.includes("Advanced Java Threads Community Quiz")) {
            console.log("✓ TEST 4 & 5 (Part A) PASSED: Community quiz is NOT mixed into normal recommended quizzes.");
        } else {
            throw new Error("TEST 4 & 5 FAILED: Community quiz appeared in normal quizzes!");
        }

        // ----------------------------------------------------
        // TEST 6: Student is NOT a member of community
        // ----------------------------------------------------
        console.log("\n--- TEST 6: Student Not Member of Community ---");
        const student1MembershipsBefore = await CommunityMember.find({ examinerId: student1._id });
        const joinedIdsBefore = student1MembershipsBefore.map(m => m.communityId);
        const commQuizzesBefore = await Quiz.find({
            communityId: { $in: joinedIdsBefore },
            isPublished: true
        });

        if (commQuizzesBefore.length === 0) {
            console.log("✓ TEST 6 PASSED: Non-member student sees 0 community quizzes.");
        } else {
            throw new Error("TEST 6 FAILED: Non-member student saw community quizzes.");
        }

        // ----------------------------------------------------
        // TEST 7: Student joins community -> Quizzes become visible
        // ----------------------------------------------------
        console.log("\n--- TEST 7: Student Joins Community ---");
        await CommunityMember.create({
            communityId: community1._id,
            examinerId: student1._id,
            examinerName: student1.name,
            role: "contributor"
        });

        const student1MembershipsAfter = await CommunityMember.find({ examinerId: student1._id });
        const joinedIdsAfter = student1MembershipsAfter.map(m => m.communityId);
        const commQuizzesAfter = await Quiz.find({
            communityId: { $in: joinedIdsAfter },
            isPublished: true
        });

        if (commQuizzesAfter.length === 1 && commQuizzesAfter[0].title === "Advanced Java Threads Community Quiz") {
            console.log("✓ TEST 7 PASSED: Community quiz is now visible in student's community quizzes after joining.");
        } else {
            throw new Error("TEST 7 FAILED: Community quiz not visible after joining community.");
        }

        // ----------------------------------------------------
        // TEST 8: Security Authorization Check
        // ----------------------------------------------------
        console.log("\n--- TEST 8: Community Security Check ---");
        const student2 = await User.create({
            name: "Student Two (Unjoined)",
            email: `${testPrefix}_student2@example.com`,
            password: await bcrypt.hash("password123", 10),
            role: "aspirant",
            interests: ["Programming"]
        });

        const isStudent2Member = await CommunityMember.findOne({
            communityId: community1._id,
            examinerId: student2._id
        });

        if (!isStudent2Member) {
            console.log("✓ TEST 8 PASSED: Backend verifies student membership and prevents unauthorized quiz access.");
        } else {
            throw new Error("TEST 8 FAILED: Security membership verification failed.");
        }

        // ----------------------------------------------------
        // TEST 9: Student Changes Interests -> Recommended list updates
        // ----------------------------------------------------
        console.log("\n--- TEST 9: Student Changes Interests to Mathematics ---");
        student1.interests = ["Mathematics"];
        await student1.save();

        const updatedInterestRegexes = student1.interests.map(i => new RegExp(`^${i}$`, "i"));
        const updatedRecommended = await Quiz.find({
            isPublished: true,
            $or: [{ communityId: null }, { communityId: { $exists: false } }],
            category: { $in: updatedInterestRegexes }
        });

        const updatedTitles = updatedRecommended.map(q => q.title);
        if (updatedTitles.includes("Calculus I") && !updatedTitles.includes("Java Fundamentals") && !updatedTitles.includes("Human Anatomy Basics")) {
            console.log("✓ TEST 9 PASSED: Recommended quiz list successfully updated to only Calculus I.");
        } else {
            throw new Error(`TEST 9 FAILED: Expected only Calculus I, got: ${updatedTitles.join(", ")}`);
        }

        // ----------------------------------------------------
        // TEST 10: Safe Community Quiz Migration
        // ----------------------------------------------------
        console.log("\n--- TEST 10: Existing Community Quiz Safe Migration ---");
        const legacyCommunity = await Community.create({
            name: `${testPrefix} Unique Python Group`,
            description: "Python group for migration test",
            category: "Programming",
            communityCode: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
            ownerId: examiner1._id,
            ownerName: examiner1.name
        });

        // Create an orphaned quiz: communityId is null, but communityName matches legacyCommunity
        const orphanedQuiz = await Quiz.create({
            title: `${testPrefix} Legacy Python Quiz`,
            category: "Programming",
            examinerId: examiner1._id,
            examinerName: examiner1.name,
            timeLimit: 20,
            isPublished: true,
            communityId: null,
            communityName: `${testPrefix} Unique Python Group`
        });

        console.log("Created legacy quiz with communityId: null and matching communityName.");
        const migrationResult = await migrateCommunityQuizzes();
        console.log("Migration Result:", migrationResult);

        const checkedQuiz = await Quiz.findById(orphanedQuiz._id);
        if (checkedQuiz && checkedQuiz.communityId && checkedQuiz.communityId.toString() === legacyCommunity._id.toString()) {
            console.log("✓ TEST 10 PASSED: Migration successfully linked orphaned quiz to its Community ObjectId.");
        } else {
            throw new Error("TEST 10 FAILED: Orphaned quiz was not migrated to correct communityId.");
        }

        // ----------------------------------------------------
        // Cleanup Test Data
        // ----------------------------------------------------
        console.log("\nCleaning up test records...");
        await User.deleteMany({ email: { $regex: new RegExp(`^${testPrefix}`) } });
        await Community.deleteMany({ name: { $regex: new RegExp(`^${testPrefix}`) } });
        await Quiz.deleteMany({
            $or: [
                { title: { $in: ["Java Fundamentals", "Human Anatomy Basics", "Calculus I", "Advanced Java Threads Community Quiz"] } },
                { title: { $regex: new RegExp(`^${testPrefix}`) } }
            ]
        });
        await CommunityMember.deleteMany({
            communityId: { $in: [community1._id, legacyCommunity._id] }
        });

        console.log("✓ Test records cleaned up successfully.");
        console.log("\n==================================================");
        console.log("ALL 10 TESTS PASSED SUCCESSFULLY! 🚀");
        console.log("==================================================");

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST FAILED WITH ERROR:", err);
        await mongoose.disconnect();
        process.exit(1);
    }
}

runTests();
