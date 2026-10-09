const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Attempt = require("../models/Attempt");
const AIExplanation = require("../models/AIExplanation");

async function runFullVerification() {
  console.log("===============================================================");
  console.log("🚀 STARTING FULL END-TO-END AI EXPLANATION VERIFICATION TEST");
  console.log("===============================================================");

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quiz_db";
  await mongoose.connect(mongoUri);
  console.log("[DB] Connected to MongoDB:", mongoUri);

  try {
    // 1. Setup Test Users
    let examiner = await User.findOne({ email: "examiner_ai_test@example.com" });
    if (!examiner) {
      examiner = await User.create({
        name: "Test Examiner AI",
        email: "examiner_ai_test@example.com",
        password: "password123",
        role: "examiner"
      });
    }

    let studentA = await User.findOne({ email: "student_a_ai_test@example.com" });
    if (!studentA) {
      studentA = await User.create({
        name: "Student A AI",
        email: "student_a_ai_test@example.com",
        password: "password123",
        role: "aspirant"
      });
    }

    let studentB = await User.findOne({ email: "student_b_ai_test@example.com" });
    if (!studentB) {
      studentB = await User.create({
        name: "Student B AI",
        email: "student_b_ai_test@example.com",
        password: "password123",
        role: "aspirant"
      });
    }

    const tokenA = jwt.sign(
      { id: studentA._id.toString(), role: studentA.role, name: studentA.name },
      process.env.JWT_SECRET || "myquizsecretkey",
      { expiresIn: "1h" }
    );

    const tokenB = jwt.sign(
      { id: studentB._id.toString(), role: studentB.role, name: studentB.name },
      process.env.JWT_SECRET || "myquizsecretkey",
      { expiresIn: "1h" }
    );

    // 2. Setup Test Quiz and Questions
    const testQuiz = await Quiz.create({
      title: "Java OOP & Algorithms AI Test Quiz",
      examinerId: examiner._id,
      examinerName: examiner.name,
      category: "Computer Science",
      timeLimit: 15,
      quizCode: `AI${Date.now().toString().slice(-4)}`,
      isPublished: true
    });

    const q1 = await Question.create({
      quizId: testQuiz._id,
      questionType: "MCQ",
      question: "Which keyword is used to inherit a class in Java?",
      options: ["A. implements", "B. extends", "C. inherits", "D. using"],
      correctAnswer: "B. extends",
      marks: 1
    });

    const q2 = await Question.create({
      quizId: testQuiz._id,
      questionType: "MCQ",
      question: "What is polymorphism in Object-Oriented Programming?",
      options: [
        "A. The ability of an object to take on multiple forms",
        "B. Storing data in private variables",
        "C. Creating multiple copies of a class",
        "D. Deleting unused memory"
      ],
      correctAnswer: "A. The ability of an object to take on multiple forms",
      marks: 1
    });

    const q3 = await Question.create({
      quizId: testQuiz._id,
      questionType: "MCQ",
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["A. O(n log n)", "B. O(1)", "C. O(n^2)", "D. O(log n)"],
      correctAnswer: "C. O(n^2)",
      marks: 1
    });

    // 3. Create Attempt for Student A (Q1: Correct, Q2: Incorrect, Q3: Unanswered)
    const attemptA = await Attempt.create({
      quizId: testQuiz._id,
      aspirantId: studentA._id,
      answers: [
        {
          questionId: q1._id,
          selectedAnswer: "B. extends",
          isCorrect: true
        },
        {
          questionId: q2._id,
          selectedAnswer: "B. Storing data in private variables",
          isCorrect: false
        },
        {
          questionId: q3._id,
          selectedAnswer: "",
          isCorrect: false
        }
      ],
      score: 1,
      totalMarks: 3,
      percentage: 33.33,
      quizVersion: 1
    });

    // Create Attempt for Student B
    const attemptB = await Attempt.create({
      quizId: testQuiz._id,
      aspirantId: studentB._id,
      answers: [
        {
          questionId: q1._id,
          selectedAnswer: "B. extends",
          isCorrect: true
        }
      ],
      score: 1,
      totalMarks: 3,
      percentage: 33.33,
      quizVersion: 1
    });

    console.log("[SETUP] Created test quiz, questions, and attempts for Student A & B.");

    // 4. Test Node.js AI Controller functions directly and/or via HTTP
    const { explainQuestion, getAttemptExplanations } = require("../controllers/aiController");

    // Helper mock response
    function createMockRes() {
      return {
        statusCode: 200,
        data: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.data = payload;
          return this;
        }
      };
    }

    console.log("\n--- TEST 1: Student A requests AI explanation for Correct Answer (Q1) ---");
    const req1 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      body: { attemptId: attemptA._id.toString(), questionId: q1._id.toString() }
    };
    const res1 = createMockRes();
    await explainQuestion(req1, res1);
    console.log("Status:", res1.statusCode);
    console.log("Success:", res1.data?.success);
    console.log("Cached:", res1.data?.cached);
    console.log("Question Explanation:", res1.data?.explanation?.questionExplanation);
    console.log("Correct Answer Explanation:", res1.data?.explanation?.correctAnswerExplanation);
    console.log("Student Answer Explanation:", `'${res1.data?.explanation?.studentAnswerExplanation}' (Expected empty)`);
    if (res1.statusCode !== 200 || !res1.data?.success) {
      throw new Error(`TEST 1 Failed with status ${res1.statusCode}: ${JSON.stringify(res1.data)}`);
    }

    console.log("\n--- TEST 2: Student A requests AI explanation for Incorrect Answer (Q2) ---");
    const req2 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      body: { attemptId: attemptA._id.toString(), questionId: q2._id.toString() }
    };
    const res2 = createMockRes();
    await explainQuestion(req2, res2);
    console.log("Status:", res2.statusCode);
    console.log("Success:", res2.data?.success);
    console.log("Student Answer Explanation:", res2.data?.explanation?.studentAnswerExplanation);
    console.log("Concept:", res2.data?.explanation?.conceptExplanation);
    if (res2.statusCode !== 200 || !res2.data?.explanation?.studentAnswerExplanation) {
      throw new Error(`TEST 2 Failed with status ${res2.statusCode}`);
    }

    console.log("\n--- TEST 3: Student A requests AI explanation for Unanswered Question (Q3) ---");
    const req3 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      body: { attemptId: attemptA._id.toString(), questionId: q3._id.toString() }
    };
    const res3 = createMockRes();
    await explainQuestion(req3, res3);
    console.log("Status:", res3.statusCode);
    console.log("Success:", res3.data?.success);
    console.log("Correct Answer Explanation:", res3.data?.explanation?.correctAnswerExplanation);
    if (res3.statusCode !== 200 || !res3.data?.success) {
      throw new Error(`TEST 3 Failed with status ${res3.statusCode}`);
    }

    console.log("\n--- TEST 4: Caching Verification (Repeat request for Q1) ---");
    const req4 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      body: { attemptId: attemptA._id.toString(), questionId: q1._id.toString() }
    };
    const res4 = createMockRes();
    await explainQuestion(req4, res4);
    console.log("Status:", res4.statusCode);
    console.log("Cached Flag:", res4.data?.cached);
    if (res4.statusCode !== 200 || res4.data?.cached !== true) {
      throw new Error("TEST 4 Failed: Expected response to be cached!");
    }

    console.log("\n--- TEST 5: Security Ownership Test (Student A requests Student B's attempt) ---");
    const req5 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      body: { attemptId: attemptB._id.toString(), questionId: q1._id.toString() }
    };
    const res5 = createMockRes();
    await explainQuestion(req5, res5);
    console.log("Status:", res5.statusCode);
    console.log("Message:", res5.data?.message);
    if (res5.statusCode !== 403) {
      throw new Error(`TEST 5 Failed: Expected 403 Forbidden, got ${res5.statusCode}`);
    }

    console.log("\n--- TEST 6: Question Not In Attempt Test ---");
    const externalQuestion = await Question.create({
      quizId: new mongoose.Types.ObjectId(),
      question: "External Question?",
      options: ["A", "B"],
      correctAnswer: "A"
    });
    const req6 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      body: { attemptId: attemptA._id.toString(), questionId: externalQuestion._id.toString() }
    };
    const res6 = createMockRes();
    await explainQuestion(req6, res6);
    console.log("Status:", res6.statusCode);
    console.log("Message:", res6.data?.message);
    if (res6.statusCode !== 400) {
      throw new Error(`TEST 6 Failed: Expected 400 Bad Request, got ${res6.statusCode}`);
    }

    console.log("\n--- TEST 7: Get All Cached Explanations for Attempt ---");
    const req7 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      params: { attemptId: attemptA._id.toString() }
    };
    const res7 = createMockRes();
    await getAttemptExplanations(req7, res7);
    console.log("Status:", res7.statusCode);
    console.log("Total Cached Explanations:", res7.data?.explanations?.length);
    if (res7.statusCode !== 200 || res7.data?.explanations?.length < 3) {
      throw new Error(`TEST 7 Failed: Expected at least 3 cached explanations, got ${res7.data?.explanations?.length}`);
    }

    console.log("\n--- TEST 8: Verify getPerformanceDetails Populates Options ---");
    const { getPerformanceDetails } = require("../controllers/performanceController");
    const req8 = {
      user: { id: studentA._id.toString(), role: "aspirant" },
      params: { attemptId: attemptA._id.toString() }
    };
    const res8 = createMockRes();
    await getPerformanceDetails(req8, res8);
    console.log("Status:", res8.statusCode);
    const populatedQ1 = res8.data?.attempt?.answers[0]?.questionId;
    console.log("Populated Q1 options:", populatedQ1?.options);
    if (!populatedQ1?.options || populatedQ1.options.length === 0) {
      throw new Error("TEST 8 Failed: Options were not populated in getPerformanceDetails!");
    }

    // Cleanup test records
    await AIExplanation.deleteMany({ attemptId: { $in: [attemptA._id, attemptB._id] } });
    await Attempt.deleteMany({ _id: { $in: [attemptA._id, attemptB._id] } });
    await Question.deleteMany({ quizId: testQuiz._id });
    await Question.deleteOne({ _id: externalQuestion._id });
    await Quiz.deleteOne({ _id: testQuiz._id });

    console.log("\n===============================================================");
    console.log("🎉 ALL END-TO-END VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
    console.log("===============================================================");
  } catch (err) {
    console.error("❌ VERIFICATION TEST FAILED:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runFullVerification();
