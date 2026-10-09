const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quiz_db";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

async function runTests() {
    console.log("=================================================");
    console.log("   COMMUNITY & INTEREST SYSTEM VERIFICATION SUITE");
    console.log("=================================================");

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    let passedCount = 0;
    let failedCount = 0;

    const assert = (condition, testName, details = "") => {
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passedCount++;
        } else {
            console.error(`❌ [FAIL] ${testName} - ${details}`);
            failedCount++;
        }
    };

    try {
        // Clean test artifacts
        const testEmailPrefix = "comm_test_" + Date.now();

        // 1. Create an examiner
        const hashedPassword = await bcrypt.hash("Password123!", 10);
        const examiner = await User.create({
            name: "Test Examiner",
            email: `${testEmailPrefix}_examiner@test.com`,
            password: hashedPassword,
            role: "examiner"
        });

        // 2. Create Student with interest = ['Programming']
        const student = await User.create({
            name: "Test Student",
            email: `${testEmailPrefix}_student@test.com`,
            password: hashedPassword,
            role: "aspirant",
            interests: ["Programming"]
        });

        // 3. Create Communities: Programming, Medical, Engineering, Aptitude
        const progCommunity = await Community.create({
            name: "Programming Devs Hub",
            description: "All things code",
            category: "Programming",
            visibility: "public",
            communityCode: "COM-PROG-" + Date.now().toString().slice(-4),
            ownerId: examiner._id,
            ownerName: examiner.name
        });

        const medCommunity = await Community.create({
            name: "Medical Research Society",
            description: "Medical science & health",
            category: "Medical",
            visibility: "public",
            communityCode: "COM-MED-" + Date.now().toString().slice(-4),
            ownerId: examiner._id,
            ownerName: examiner.name
        });

        const engCommunity = await Community.create({
            name: "Engineering Excellence",
            description: "Mechanical & electrical",
            category: "Engineering",
            visibility: "public",
            communityCode: "COM-ENG-" + Date.now().toString().slice(-4),
            ownerId: examiner._id,
            ownerName: examiner.name
        });

        const crossMedCommunity = await Community.create({
            name: "Java Medical Tech",
            description: "Cross category with Java in name",
            category: "Medical",
            visibility: "public",
            communityCode: "COM-JMED-" + Date.now().toString().slice(-4),
            ownerId: examiner._id,
            ownerName: examiner.name
        });

        // =========================================================================
        // TEST 1: Student interest = ['Programming'] -> Discover Communities shows only Programming
        // =========================================================================
        {
            const user = await User.findById(student._id);
            const interests = user.interests || [];
            const interestRegexes = interests.map(i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));
            const discoverResults = await Community.find({
                category: { $in: interestRegexes },
                isActive: true
            });

            const visibleCategories = discoverResults.map(c => c.category);
            const hasProgramming = visibleCategories.includes("Programming");
            const hasMedical = visibleCategories.includes("Medical");
            const hasEngineering = visibleCategories.includes("Engineering");

            assert(
                hasProgramming && !hasMedical && !hasEngineering,
                "TEST 1: Student with ['Programming'] interest sees ONLY Programming communities",
                `Visible categories: ${visibleCategories.join(", ")}`
            );
        }

        // =========================================================================
        // TEST 2: Student interests = ['Programming', 'Engineering'] -> Programming + Engineering visible, Medical hidden
        // =========================================================================
        {
            await User.findByIdAndUpdate(student._id, { interests: ["Programming", "Engineering"] });
            const user = await User.findById(student._id);
            const interests = user.interests;
            const interestRegexes = interests.map(i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));
            const discoverResults = await Community.find({
                category: { $in: interestRegexes },
                isActive: true
            });

            const visibleCategories = [...new Set(discoverResults.map(c => c.category))];
            const hasProgramming = visibleCategories.includes("Programming");
            const hasEngineering = visibleCategories.includes("Engineering");
            const hasMedical = visibleCategories.includes("Medical");

            assert(
                hasProgramming && hasEngineering && !hasMedical,
                "TEST 2: Student with ['Programming', 'Engineering'] sees Programming & Engineering, Medical hidden",
                `Visible categories: ${visibleCategories.join(", ")}`
            );
        }

        // Reset student interests to ['Programming']
        await User.findByIdAndUpdate(student._id, { interests: ["Programming"] });

        // =========================================================================
        // TEST 3: Search within interest-filtered communities (Interest FIRST, search SECOND)
        // Searching 'Java' should match 'Programming Devs Hub' if related, but NOT 'Java Medical Tech' because category is Medical
        // =========================================================================
        {
            const user = await User.findById(student._id);
            const interests = user.interests;
            const interestRegexes = interests.map(i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));

            // 1. First backend filters by interest:
            const interestCommunities = await Community.find({
                category: { $in: interestRegexes },
                isActive: true
            });

            // 2. Then search 'Java':
            const searchResults = interestCommunities.filter(c =>
                c.name.toLowerCase().includes("java") || c.description.toLowerCase().includes("java")
            );

            // Cross-category "Java Medical Tech" must NOT be in interestCommunities
            const foundMedicalJava = interestCommunities.some(c => c._id.toString() === crossMedCommunity._id.toString());

            assert(
                !foundMedicalJava,
                "TEST 3: Search 'Java' does NOT expose 'Java Medical Tech' because Medical category is excluded by student interests",
                `Found Medical Java: ${foundMedicalJava}`
            );
        }

        // =========================================================================
        // Create Quizzes inside Programming Community
        // =========================================================================
        const progQuiz1 = await Quiz.create({
            title: "Java Fundamentals",
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: progCommunity._id,
            communityName: progCommunity.name,
            timeLimit: 30,
            isPublished: true
        });

        const progQuiz2 = await Quiz.create({
            title: "React Component Patterns",
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: progCommunity._id,
            communityName: progCommunity.name,
            timeLimit: 25,
            isPublished: true
        });

        const progQuiz3 = await Quiz.create({
            title: "Python Data Structures",
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: progCommunity._id,
            communityName: progCommunity.name,
            timeLimit: 20,
            isPublished: true
        });

        // Also create a Medical quiz inside Programming Community (cross-category in community)
        const crossQuizInProg = await Quiz.create({
            title: "Medical Informatics in Java",
            category: "Medical",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: progCommunity._id,
            communityName: progCommunity.name,
            timeLimit: 15,
            isPublished: true
        });

        // Create a Draft (isPublished: false) quiz in Programming Community
        const draftQuizInProg = await Quiz.create({
            title: "Draft Advanced Java",
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: progCommunity._id,
            communityName: progCommunity.name,
            timeLimit: 40,
            isPublished: false
        });

        // Create Quizzes inside Medical Community (unjoined)
        const medQuiz = await Quiz.create({
            title: "Human Anatomy",
            category: "Medical",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: medCommunity._id,
            communityName: medCommunity.name,
            timeLimit: 45,
            isPublished: true
        });

        // Create Normal Quizzes (communityId: null)
        const normalProgQuiz = await Quiz.create({
            title: "Public JavaScript Basics",
            category: "Programming",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: null,
            communityName: "",
            timeLimit: 20,
            isPublished: true
        });

        const normalMedQuiz = await Quiz.create({
            title: "Public Medical Terminology",
            category: "Medical",
            examinerId: examiner._id,
            examinerName: examiner.name,
            communityId: null,
            communityName: "",
            timeLimit: 20,
            isPublished: true
        });

        // =========================================================================
        // Student Joins Programming Community
        // =========================================================================
        await CommunityMember.create({
            communityId: progCommunity._id,
            examinerId: student._id,
            examinerName: student.name,
            role: "student"
        });

        // =========================================================================
        // TEST 4: Student joined Programming Community -> All published quizzes appear in Community Quizzes
        // =========================================================================
        {
            const memberships = await CommunityMember.find({ examinerId: student._id });
            const joinedCommunityIds = memberships.map(m => m.communityId);
            const commQuizzes = await Quiz.find({
                communityId: { $in: joinedCommunityIds },
                isPublished: true
            });

            const titles = commQuizzes.map(q => q.title);
            const hasJava = titles.includes("Java Fundamentals");
            const hasReact = titles.includes("React Component Patterns");
            const hasPython = titles.includes("Python Data Structures");

            assert(
                hasJava && hasReact && hasPython,
                "TEST 4: All published quizzes in joined Programming Community appear in Community Quizzes",
                `Quizzes found: ${titles.join(", ")}`
            );
        }

        // =========================================================================
        // TEST 5: Cross-category quiz in joined community (Medical quiz in Programming community) appears in Community Quizzes
        // Membership controls community quiz access, NOT student interests!
        // =========================================================================
        {
            const memberships = await CommunityMember.find({ examinerId: student._id });
            const joinedCommunityIds = memberships.map(m => m.communityId);
            const commQuizzes = await Quiz.find({
                communityId: { $in: joinedCommunityIds },
                isPublished: true
            });

            const titles = commQuizzes.map(q => q.title);
            const hasCrossMedQuiz = titles.includes("Medical Informatics in Java");

            assert(
                hasCrossMedQuiz,
                "TEST 5: Medical quiz inside joined Programming community STILL appears because membership controls access",
                `Quizzes found: ${titles.join(", ")}`
            );
        }

        // =========================================================================
        // TEST 6: Student has NOT joined Medical Community -> Its quizzes do NOT appear in Community Quizzes
        // =========================================================================
        {
            const memberships = await CommunityMember.find({ examinerId: student._id });
            const joinedCommunityIds = memberships.map(m => m.communityId);
            const commQuizzes = await Quiz.find({
                communityId: { $in: joinedCommunityIds },
                isPublished: true
            });

            const titles = commQuizzes.map(q => q.title);
            const hasMedQuiz = titles.includes("Human Anatomy");

            assert(
                !hasMedQuiz,
                "TEST 6: Quizzes from unjoined Medical Community do NOT appear in student's Community Quizzes",
                `Has Human Anatomy: ${hasMedQuiz}`
            );
        }

        // =========================================================================
        // TEST 7: Normal quiz: category = 'Programming', communityId = null, isPublished = true
        // Student interest = 'Programming' -> Visible in normal Quiz section
        // =========================================================================
        {
            const user = await User.findById(student._id);
            const interestRegexes = user.interests.map(i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));
            const normalQuizzes = await Quiz.find({
                isPublished: true,
                $or: [{ communityId: null }, { communityId: { $exists: false } }],
                category: { $in: interestRegexes }
            });

            const titles = normalQuizzes.map(q => q.title);
            const hasNormalProg = titles.includes("Public JavaScript Basics");
            const hasNormalMed = titles.includes("Public Medical Terminology");

            assert(
                hasNormalProg && !hasNormalMed,
                "TEST 7: Normal quiz section shows matching Programming quiz and hides non-matching Medical quiz",
                `Normal quizzes visible: ${titles.join(", ")}`
            );
        }

        // =========================================================================
        // TEST 8: Community quiz: category = 'Programming', communityId != null, isPublished = true
        // Student is a member. Expected: NOT visible in normal quiz section, Visible in Community Quizzes
        // =========================================================================
        {
            const user = await User.findById(student._id);
            const interestRegexes = user.interests.map(i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));
            const normalQuizzes = await Quiz.find({
                isPublished: true,
                $or: [{ communityId: null }, { communityId: { $exists: false } }],
                category: { $in: interestRegexes }
            });

            const normalTitles = normalQuizzes.map(q => q.title);
            const progQuiz1InNormal = normalTitles.includes("Java Fundamentals");

            const memberships = await CommunityMember.find({ examinerId: student._id });
            const joinedCommunityIds = memberships.map(m => m.communityId);
            const commQuizzes = await Quiz.find({
                communityId: { $in: joinedCommunityIds },
                isPublished: true
            });
            const commTitles = commQuizzes.map(q => q.title);
            const progQuiz1InComm = commTitles.includes("Java Fundamentals");

            assert(
                !progQuiz1InNormal && progQuiz1InComm,
                "TEST 8: Community quiz is NOT visible in normal Quiz section, but IS visible in Community Quizzes",
                `In normal: ${progQuiz1InNormal}, In community: ${progQuiz1InComm}`
            );
        }

        // =========================================================================
        // TEST 9: Community quiz: communityId != null, isPublished = false (Draft)
        // Expected: NOT visible to student in Community Quizzes
        // =========================================================================
        {
            const memberships = await CommunityMember.find({ examinerId: student._id });
            const joinedCommunityIds = memberships.map(m => m.communityId);
            const studentCommQuizzes = await Quiz.find({
                communityId: { $in: joinedCommunityIds },
                isPublished: true
            });

            const titles = studentCommQuizzes.map(q => q.title);
            const hasDraft = titles.includes("Draft Advanced Java");

            assert(
                !hasDraft,
                "TEST 9: Draft community quiz (isPublished: false) is NOT visible to student",
                `Has draft: ${hasDraft}`
            );
        }

        // =========================================================================
        // TEST 10: Student changes interests from 'Programming' to 'Medical'
        // Expected: Discover Communities changes to Medical communities;
        // Previously joined Programming community REMAINS in My Communities.
        // =========================================================================
        {
            // Update student interests to 'Medical'
            await User.findByIdAndUpdate(student._id, { interests: ["Medical"] });
            const updatedUser = await User.findById(student._id);

            // 1. Discover communities with new interest
            const newInterestRegexes = updatedUser.interests.map(i => new RegExp(`^${i.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i"));
            const discoverResults = await Community.find({
                category: { $in: newInterestRegexes },
                isActive: true
            });
            const discoverCategories = [...new Set(discoverResults.map(c => c.category))];
            const discoverShowsMedical = discoverCategories.includes("Medical");
            const discoverShowsProg = discoverCategories.includes("Programming");

            // 2. My Communities check:
            const memberships = await CommunityMember.find({ examinerId: student._id });
            const joinedCommunityIds = memberships.map(m => m.communityId);
            const myCommunities = await Community.find({
                _id: { $in: joinedCommunityIds }
            });
            const myCommunityNames = myCommunities.map(c => c.name);
            const retainsProgCommunity = myCommunityNames.includes("Programming Devs Hub");

            assert(
                discoverShowsMedical && !discoverShowsProg && retainsProgCommunity,
                "TEST 10: Changing interests to 'Medical' updates Discover Communities to Medical while keeping previously joined Programming community in My Communities",
                `Discover categories: ${discoverCategories.join(", ")}, My Communities: ${myCommunityNames.join(", ")}`
            );
        }

        // =========================================================================
        // Clean up test data
        // =========================================================================
        await User.deleteMany({ email: { $regex: testEmailPrefix } });
        await Community.deleteMany({ _id: { $in: [progCommunity._id, medCommunity._id, engCommunity._id, crossMedCommunity._id] } });
        await CommunityMember.deleteMany({ examinerId: student._id });
        await Quiz.deleteMany({
            _id: {
                $in: [
                    progQuiz1._id, progQuiz2._id, progQuiz3._id, crossQuizInProg._id,
                    draftQuizInProg._id, medQuiz._id, normalProgQuiz._id, normalMedQuiz._id
                ]
            }
        });

        console.log("\n=================================================");
        console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED out of ${passedCount + failedCount} TESTS`);
        console.log("=================================================");

    } catch (err) {
        console.error("Test execution failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

runTests();
