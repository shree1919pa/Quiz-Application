const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: "c:/Users/patle/OneDrive/Desktop/Online Quiz Application/backend/.env" });

const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");

async function runTests() {
    console.log("===============================================================");
    console.log("RUNNING STUDENT INTEREST-BASED NORMAL QUIZ FILTERING TEST SUITE");
    console.log("===============================================================");

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB\n");

        const testPrefix = "filter_test_" + Date.now();

        // 1. Create Examiner
        const examiner = await User.create({
            name: "Test Examiner",
            email: `${testPrefix}_examiner@test.com`,
            password: await bcrypt.hash("pass123", 10),
            role: "examiner"
        });

        // 2. Create Community
        const community = await Community.create({
            name: `${testPrefix} Code Club`,
            description: "Programming Community",
            category: "Programming",
            communityCode: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
            ownerId: examiner._id,
            ownerName: examiner.name
        });

        // 3. Create Sample Quizzes
        const progNormalQuiz = await Quiz.create({
            title: `${testPrefix} JS Fundamentals`,
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            timeLimit: 15,
            isPublished: true,
            communityId: null,
            communityName: ""
        });

        const medNormalQuiz = await Quiz.create({
            title: `${testPrefix} Basic Biology`,
            category: "Medical",
            examinerId: examiner._id,
            examinerName: examiner.name,
            timeLimit: 20,
            isPublished: true,
            communityId: null,
            communityName: ""
        });

        const mathNormalQuiz = await Quiz.create({
            title: `${testPrefix} Algebra 101`,
            category: "Mathematics",
            examinerId: examiner._id,
            examinerName: examiner.name,
            timeLimit: 25,
            isPublished: true,
            communityId: null,
            communityName: ""
        });

        const progCommQuiz = await Quiz.create({
            title: `${testPrefix} Advanced JS in Community`,
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            timeLimit: 30,
            isPublished: true,
            communityId: community._id,
            communityName: community.name
        });

        const progDraftQuiz = await Quiz.create({
            title: `${testPrefix} Draft Programming Quiz`,
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            timeLimit: 10,
            isPublished: false,
            communityId: null,
            communityName: ""
        });

        // Helper function mimicking the getPublishedQuizzes logic
        async function getNormalQuizzesForStudent(studentUser) {
            const studentInterests = studentUser?.interests || [];
            if (studentInterests.length === 0) {
                return {
                    requiresInterests: true,
                    message: "Please select your interests to see recommended exams.",
                    quizzes: []
                };
            }

            const interestRegexes = studentInterests.map(
                interest => new RegExp(`^${interest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i")
            );

            const quizzes = await Quiz.find({
                isPublished: true,
                $or: [
                    { communityId: null },
                    { communityId: { $exists: false } }
                ],
                category: { $in: interestRegexes },
                title: { $regex: new RegExp(`^${testPrefix}`) }
            }).sort({ createdAt: -1 }).lean();

            return {
                requiresInterests: false,
                quizzes
            };
        }

        // -----------------------------------------------------------
        // TEST 1: Student interests = ['Programming']
        // Normal Quiz = Programming, communityId = null, isPublished = true
        // Expected: VISIBLE
        // -----------------------------------------------------------
        console.log("--- TEST 1: Student Interest: Programming -> Programming Normal Quiz is VISIBLE ---");
        const student = await User.create({
            name: "Test Student",
            email: `${testPrefix}_student@test.com`,
            password: await bcrypt.hash("pass123", 10),
            role: "aspirant",
            interests: ["Programming"]
        });

        const res1 = await getNormalQuizzesForStudent(student);
        const titles1 = res1.quizzes.map(q => q.title);
        if (titles1.includes(progNormalQuiz.title)) {
            console.log(`✓ TEST 1 PASSED: '${progNormalQuiz.title}' is VISIBLE in normal Quiz section.`);
        } else {
            throw new Error(`TEST 1 FAILED: '${progNormalQuiz.title}' was NOT found in results.`);
        }

        // -----------------------------------------------------------
        // TEST 2: Student interests = ['Programming']
        // Normal Quiz = Medical, communityId = null, isPublished = true
        // Expected: NOT VISIBLE
        // -----------------------------------------------------------
        console.log("\n--- TEST 2: Student Interest: Programming -> Medical Quiz is NOT VISIBLE ---");
        if (!titles1.includes(medNormalQuiz.title)) {
            console.log(`✓ TEST 2 PASSED: '${medNormalQuiz.title}' is NOT VISIBLE for Programming student.`);
        } else {
            throw new Error(`TEST 2 FAILED: '${medNormalQuiz.title}' should NOT be visible.`);
        }

        // -----------------------------------------------------------
        // TEST 3: Student interests = ['Programming']
        // Community Quiz = Programming, communityId = ObjectId(...), isPublished = true
        // Expected: NOT VISIBLE in normal quiz section
        // -----------------------------------------------------------
        console.log("\n--- TEST 3: Community Quiz with Programming category is NOT VISIBLE in normal section ---");
        if (!titles1.includes(progCommQuiz.title)) {
            console.log(`✓ TEST 3 PASSED: Community quiz '${progCommQuiz.title}' is NOT VISIBLE in normal quiz section.`);
        } else {
            throw new Error(`TEST 3 FAILED: Community quiz '${progCommQuiz.title}' appeared in normal quiz section!`);
        }

        // -----------------------------------------------------------
        // TEST 4: Student interests = ['Programming', 'Mathematics']
        // Expected: Programming & Mathematics visible, Medical hidden
        // -----------------------------------------------------------
        console.log("\n--- TEST 4: Student Interests: Programming & Mathematics ---");
        student.interests = ["Programming", "Mathematics"];
        await student.save();

        const res4 = await getNormalQuizzesForStudent(student);
        const titles4 = res4.quizzes.map(q => q.title);

        const hasProg = titles4.includes(progNormalQuiz.title);
        const hasMath = titles4.includes(mathNormalQuiz.title);
        const hasMed = titles4.includes(medNormalQuiz.title);

        if (hasProg && hasMath && !hasMed) {
            console.log("✓ TEST 4 PASSED: Programming and Mathematics are visible; Medical is hidden.");
        } else {
            throw new Error(`TEST 4 FAILED: Expected Prog & Math visible, Med hidden. Got: ${titles4.join(", ")}`);
        }

        // -----------------------------------------------------------
        // TEST 5: Draft Quiz (isPublished = false)
        // Expected: NOT VISIBLE
        // -----------------------------------------------------------
        console.log("\n--- TEST 5: Draft Quiz (isPublished: false) is NOT VISIBLE ---");
        if (!titles4.includes(progDraftQuiz.title)) {
            console.log(`✓ TEST 5 PASSED: Draft quiz '${progDraftQuiz.title}' is NOT VISIBLE.`);
        } else {
            throw new Error(`TEST 5 FAILED: Draft quiz '${progDraftQuiz.title}' was returned!`);
        }

        // -----------------------------------------------------------
        // TEST 6: Student has NO interests (interests = [])
        // Expected: requiresInterests = true, empty array
        // -----------------------------------------------------------
        console.log("\n--- TEST 6: Student has NO interests ---");
        student.interests = [];
        await student.save();

        const res6 = await getNormalQuizzesForStudent(student);
        if (res6.requiresInterests === true && res6.quizzes.length === 0) {
            console.log(`✓ TEST 6 PASSED: Correctly prompts '${res6.message}' with 0 quizzes shown.`);
        } else {
            throw new Error("TEST 6 FAILED: Quizzes were shown to a student without interests.");
        }

        // -----------------------------------------------------------
        // TEST 7: Student changes interests from Programming to Medical
        // Expected: Programming quizzes disappear, Medical quizzes appear
        // -----------------------------------------------------------
        console.log("\n--- TEST 7: Student changes interests from Programming to Medical ---");
        student.interests = ["Medical"];
        await student.save();

        const res7 = await getNormalQuizzesForStudent(student);
        const titles7 = res7.quizzes.map(q => q.title);

        if (titles7.includes(medNormalQuiz.title) && !titles7.includes(progNormalQuiz.title) && !titles7.includes(mathNormalQuiz.title)) {
            console.log(`✓ TEST 7 PASSED: Programming quizzes disappeared; Medical quiz '${medNormalQuiz.title}' appeared.`);
        } else {
            throw new Error(`TEST 7 FAILED: Expected only Medical quiz, got: ${titles7.join(", ")}`);
        }

        // -----------------------------------------------------------
        // Cleanup Test Data
        // -----------------------------------------------------------
        console.log("\nCleaning up test records...");
        await User.deleteMany({ email: { $regex: new RegExp(`^${testPrefix}`) } });
        await Community.deleteMany({ name: { $regex: new RegExp(`^${testPrefix}`) } });
        await Quiz.deleteMany({ title: { $regex: new RegExp(`^${testPrefix}`) } });
        console.log("✓ Cleanup complete.");

        console.log("\n===============================================================");
        console.log("ALL 7 SPECIFIED TEST CASES PASSED WITH 100% SUCCESS! 🚀");
        console.log("===============================================================");

        await mongoose.disconnect();
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST ERROR:", err);
        await mongoose.disconnect();
        process.exit(1);
    }
}

runTests();
