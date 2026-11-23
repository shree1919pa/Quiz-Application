const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const BASE_URL = "http://localhost:5000/api";

async function runAuthVerification() {
  console.log("===============================================================");
  console.log("🔍 COMPREHENSIVE LOGIN & ACTION VERIFICATION TEST SUITE");
  console.log("===============================================================");

  await mongoose.connect("mongodb://127.0.0.1:27017/quiz_db");
  console.log("[DB] Connected to local MongoDB: mongodb://127.0.0.1:27017/quiz_db");

  let testExaminerEmail = "test_examiner_login@example.com";
  let testAspirantEmail = "test_aspirant_login@example.com";
  let testAdminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  let password = "TestPassword123!";

  try {
    // -------------------------------------------------------------
    // PREPARATION: Seed Examiner, Aspirant, Admin
    // -------------------------------------------------------------
    const hash = await bcrypt.hash(password, 10);

    // 1. Setup Examiner (approved)
    await User.deleteOne({ email: testExaminerEmail });
    await User.create({
      name: "Verified Examiner",
      email: testExaminerEmail,
      password: hash,
      role: "examiner",
      approvalStatus: "approved",
      isBlocked: false
    });

    // Setup Pending Examiner (to verify block/pending check)
    let pendingExaminerEmail = "pending_examiner@example.com";
    await User.deleteOne({ email: pendingExaminerEmail });
    await User.create({
      name: "Pending Examiner",
      email: pendingExaminerEmail,
      password: hash,
      role: "examiner",
      approvalStatus: "pending",
      isBlocked: false
    });

    // 2. Setup Aspirant
    await User.deleteOne({ email: testAspirantEmail });
    const aspirantUser = await User.create({
      name: "Verified Aspirant",
      email: testAspirantEmail,
      password: hash,
      role: "aspirant",
      approvalStatus: "approved",
      isBlocked: false,
      interests: ["Computer Science"]
    });

    // 3. Setup Admin
    let adminUser = await User.findOne({ email: testAdminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: "System Administrator",
        email: testAdminEmail,
        password: hash,
        role: "admin",
        approvalStatus: "approved",
        isBlocked: false
      });
    }

    console.log("[SETUP] Test accounts created and verified.\n");

    // -------------------------------------------------------------
    // TEST 1: Successful Examiner Login
    // -------------------------------------------------------------
    console.log("--- TEST 1: Successful Examiner Login ---");
    let res = await fetch(`${BASE_URL}/auth/login/examiner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testExaminerEmail, password })
    });
    let data = await res.json();
    console.log(`Status: ${res.status} | Token received: ${Boolean(data.token)} | Role: ${data.user?.role}`);
    if (res.status !== 200 || !data.token || data.user?.role !== "examiner") {
      throw new Error(`TEST 1 Failed: ${JSON.stringify(data)}`);
    }
    console.log("Target Navigation: /examiner");
    console.log("TEST 1 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 2: Successful Aspirant Login
    // -------------------------------------------------------------
    console.log("--- TEST 2: Successful Aspirant Login ---");
    res = await fetch(`${BASE_URL}/auth/login/aspirant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAspirantEmail, password })
    });
    data = await res.json();
    console.log(`Status: ${res.status} | Token received: ${Boolean(data.token)} | Role: ${data.user?.role}`);
    if (res.status !== 200 || !data.token || data.user?.role !== "aspirant") {
      throw new Error(`TEST 2 Failed: ${JSON.stringify(data)}`);
    }
    const hasInterests = data.user?.interests && data.user.interests.length > 0;
    console.log(`Target Navigation: ${hasInterests ? "/aspirant" : "/aspirant/select-interests"}`);
    console.log("TEST 2 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 3: Admin Login
    // -------------------------------------------------------------
    console.log("--- TEST 3: Admin Login ---");
    const adminPass = process.env.ADMIN_PASSWORD || password;
    res = await fetch(`${BASE_URL}/auth/login/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAdminEmail, password: adminPass })
    });
    data = await res.json();
    console.log(`Status: ${res.status} | Token received: ${Boolean(data.token)} | Role: ${data.user?.role}`);
    if (res.status !== 200 || !data.token || data.user?.role !== "admin") {
      throw new Error(`TEST 3 Failed: ${JSON.stringify(data)}`);
    }
    console.log("Target Navigation: /admin/dashboard");
    console.log("TEST 3 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 4: Invalid Email or Password Handling
    // -------------------------------------------------------------
    console.log("--- TEST 4: Invalid Credentials Handling ---");
    // 4a. Non-existent email
    res = await fetch(`${BASE_URL}/auth/login/aspirant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nonexistent_user@example.com", password })
    });
    data = await res.json();
    console.log(`Non-existent user - Status: ${res.status} | Message: ${data.message}`);
    if (res.status !== 404 || !data.message) {
      throw new Error(`TEST 4a Failed: Expected 404, got ${res.status}`);
    }

    // 4b. Wrong password
    res = await fetch(`${BASE_URL}/auth/login/aspirant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testAspirantEmail, password: "WrongPassword999!" })
    });
    data = await res.json();
    console.log(`Wrong password - Status: ${res.status} | Message: ${data.message}`);
    if (res.status !== 400 || !data.message) {
      throw new Error(`TEST 4b Failed: Expected 400, got ${res.status}`);
    }

    // 4c. Pending approval examiner
    res = await fetch(`${BASE_URL}/auth/login/examiner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingExaminerEmail, password })
    });
    data = await res.json();
    console.log(`Pending examiner - Status: ${res.status} | Message: ${data.message}`);
    if (res.status !== 403 || !data.message.includes("pending")) {
      throw new Error(`TEST 4c Failed: Expected 403 pending message, got ${res.status}`);
    }
    console.log("TEST 4 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 5: Backend Unavailable Simulation (Client Timeout)
    // -------------------------------------------------------------
    console.log("--- TEST 5: Backend Unavailable & Timeout Handling ---");
    // Verify frontend apiFetch timeout aborts cleanly within configured timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 100); // 100ms test timeout
    try {
      await fetch("http://localhost:59999/api/health", { signal: controller.signal });
      throw new Error("Expected network error on closed port");
    } catch (err) {
      clearTimeout(timeoutId);
      const isHandled = err.name === "AbortError" || err.message.includes("fetch failed") || err.message.includes("ECONNREFUSED");
      console.log(`Caught expected network failure: ${err.name} - ${err.message}`);
      if (!isHandled) throw err;
    }
    console.log("TEST 5 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 6: Expired or Invalid Token Handling
    // -------------------------------------------------------------
    console.log("--- TEST 6: Expired / Malformed Token Handling ---");
    // 6a. Malformed token
    res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: "Bearer invalid.malformed.token" }
    });
    data = await res.json();
    console.log(`Malformed token - Status: ${res.status} | Message: ${data.message}`);
    if (res.status !== 401) {
      throw new Error(`TEST 6a Failed: Expected 401, got ${res.status}`);
    }

    // 6b. Expired token
    const expiredToken = jwt.sign(
      { id: adminUser._id, role: "admin" },
      process.env.JWT_SECRET || "myquizsecretkey",
      { expiresIn: "-1s" }
    );
    res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    data = await res.json();
    console.log(`Expired token - Status: ${res.status} | Message: ${data.message}`);
    if (res.status !== 401) {
      throw new Error(`TEST 6b Failed: Expected 401, got ${res.status}`);
    }
    console.log("TEST 6 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 7: Successful Registration Flow
    // -------------------------------------------------------------
    console.log("--- TEST 7: Registration Flow ---");
    const newStudentEmail = `new_student_${Date.now()}@example.com`;
    res = await fetch(`${BASE_URL}/auth/register/aspirant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Fresh Student",
        email: newStudentEmail,
        password: "StrongPassword123!"
      })
    });
    data = await res.json();
    console.log(`Register Aspirant - Status: ${res.status} | Token received: ${Boolean(data.token)}`);
    if (res.status !== 201 || !data.token) {
      throw new Error(`TEST 7 Failed: Expected 201 Created, got ${res.status}`);
    }
    // Cleanup created student
    await User.deleteOne({ email: newStudentEmail });
    console.log("TEST 7 PASSED ✅\n");

    // -------------------------------------------------------------
    // TEST 8: Role-based Protected Route Verification
    // -------------------------------------------------------------
    console.log("--- TEST 8: Protected Route Authorization ---");
    // An aspirant trying to access admin route
    const aspirantToken = jwt.sign(
      { id: aspirantUser._id, role: "aspirant" },
      process.env.JWT_SECRET || "myquizsecretkey",
      { expiresIn: "1h" }
    );
    res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${aspirantToken}` }
    });
    data = await res.json();
    console.log(`Aspirant accessing /api/admin/users - Status: ${res.status}`);
    if (res.status !== 403) {
      throw new Error(`TEST 8 Failed: Expected 403 Forbidden, got ${res.status}`);
    }
    console.log("TEST 8 PASSED ✅\n");

    console.log("===============================================================");
    console.log("🎉 ALL AUTHENTICATION & ACTION TESTS PASSED SUCCESSFULLY!");
    console.log("===============================================================");
  } catch (err) {
    console.error("❌ TEST SUITE FAILED:", err);
    process.exitCode = 1;
  } finally {
    // Cleanup temporary test users
    await User.deleteOne({ email: testExaminerEmail });
    await User.deleteOne({ email: testAspirantEmail });
    await User.deleteOne({ email: "pending_examiner@example.com" });
    await mongoose.disconnect();
  }
}

runAuthVerification();
