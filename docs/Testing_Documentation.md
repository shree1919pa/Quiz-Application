# SOFTWARE TESTING AND QUALITY ASSURANCE DOCUMENTATION

## ONLINE QUIZ APPLICATION WITH MULTI-ROLE RBAC, COMMUNITIES, AND AI EXPLANATIONS

**Document Version:** 1.0.0  
**Test Plan Type:** Comprehensive System & Integration Test Suite  
**Evaluation Standard:** IEEE 829 Standard for Software Test Documentation  

---

## TABLE OF CONTENTS

1. [Testing Strategy & Methodology](#1-testing-strategy--methodology)
   * 1.1 [Unit Testing Strategy](#11-unit-testing-strategy)
   * 1.2 [Integration & API Testing Strategy](#12-integration--api-testing-strategy)
   * 1.3 [Role-Based Access Control (RBAC) Testing](#13-role-based-access-control-rbac-testing)
   * 1.4 [End-to-End (E2E) System Testing](#14-end-to-end-e2e-system-testing)
   * 1.5 [Security & Vulnerability Testing](#15-security--vulnerability-testing)
2. [Test Execution Matrix & Status Conventions](#2-test-execution-matrix--status-conventions)
3. [Module 1: Authentication & Account Verification Test Cases](#3-module-1-authentication--account-verification-test-cases)
4. [Module 2: Role-Based Authorization & Middleware Test Cases](#4-module-2-role-based-authorization--middleware-test-cases)
5. [Module 3: Administrator Governance & Approval Test Cases](#5-module-3-administrator-governance--approval-test-cases)
6. [Module 4: Examiner Quiz Authoring & Versioning Test Cases](#6-module-4-examiner-quiz-authoring--versioning-test-cases)
7. [Module 5: Collaborative Community Test Cases](#7-module-5-collaborative-community-test-cases)
8. [Module 6: Aspirant Exam Taking, Timer & Scoring Test Cases](#8-module-6-aspirant-exam-taking-timer--scoring-test-cases)
9. [Module 7: Examiner Results & Student Reports Test Cases](#9-module-7-examiner-results--student-reports-test-cases)
10. [Module 8: AI Explanation Microservice & Cache Test Cases](#10-module-8-ai-explanation-microservice--cache-test-cases)
11. [Module 9: Input Validation & Boundary Error Handling Test Cases](#11-module-9-input-validation--boundary-error-handling-test-cases)
12. [Defect Reporting & Severity Classification](#12-defect-reporting--severity-classification)

---

## 1. TESTING STRATEGY & METHODOLOGY

The testing strategy for the **Online Quiz Application** incorporates multi-tiered validation across frontend components, backend REST controllers, security middleware, database persistence, and external microservice communication.

```
+-------------------------------------------------------------------------+
|                  END-TO-END (E2E) SYSTEM TESTING                        |
|       Full user journeys: Examiner creates quiz -> Student takes exam   |
|            -> Instant grading -> AI explanation requested               |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                    INTEGRATION & REST API TESTING                       |
|   Testing route middleware, token verification, controller responses,   |
|         live DB blocking checks, and FastAPI proxy communication        |
+-------------------------------------------------------------------------+
                                    ^
+-------------------------------------------------------------------------+
|                    UNIT & COMPONENT ISOLATION TESTING                   |
|   Testing individual functions: bcrypt hashing, score calculation,     |
|         version incrementing, Pydantic schema validation                |
+-------------------------------------------------------------------------+
```

### 1.1 Unit Testing Strategy
* Verify pure algorithmic logic such as scoring percentages (`(score / totalMarks) * 100`), question shuffling algorithms, and password hashing cost factors.
* Validate Pydantic data schemas in the Python AI microservice (`ExplainQuestionRequest`, `ExplainQuestionResponse`).

### 1.2 Integration & API Testing Strategy
* Test Express REST API endpoints using HTTP assertion tools (Postman / Thunder Client / Supertest).
* Validate response status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`), JSON payload formats, and Mongoose document integrity.

### 1.3 Role-Based Access Control (RBAC) Testing
* Rigorously test route guards by attempting unauthorized actions (e.g., Aspirant attempting to create a quiz via `/api/quiz/create`, Examiner attempting to approve users via `/api/admin/examiners/approvals`).
* Validate live session termination when an administrator sets `isBlocked: true`.

### 1.4 End-to-End (E2E) System Testing
* Simulate authentic academic workflows across distinct browser sessions representing the Admin, Examiner, and Aspirant roles simultaneously.

### 1.5 Security & Vulnerability Testing
* Test against common web vulnerabilities including SQL/NoSQL injection, CORS evasion, unauthenticated token spoofing, and credential autofill leakage.

---

## 2. TEST EXECUTION MATRIX & STATUS CONVENTIONS

In accordance with academic testing protocols:
* **Preconditions:** Initial system state required before running test steps.
* **Expected Result:** The exact behavioral and data specification expected.
* **Actual Result:** The recorded observation during testing (Marked as *"Not Executed"* for baseline test plan).
* **Status:** Current test state (`Not Executed` / `Passed` / `Failed`).

---

## 3. MODULE 1: AUTHENTICATION & ACCOUNT VERIFICATION TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Aspirant successful self-registration | Database running; email not registered | 1. Navigate to `/aspirant/register`.<br/>2. Fill Name, Email, Password.<br/>3. Submit form. | Account created with `role: "aspirant"`; JWT token issued; user redirected to dashboard. | Not Executed | Not Executed |
| **TC-AUTH-02** | Examiner self-registration produces pending state | Database running; email not registered | 1. Navigate to `/examiner/register`.<br/>2. Fill Name, Email, Password.<br/>3. Submit form. | Account created with `role: "examiner"`, `approvalStatus: "pending"`; prompt displays approval message. | Not Executed | Not Executed |
| **TC-AUTH-03** | Pending Examiner login is rejected | Examiner registered with `approvalStatus: "pending"` | 1. Navigate to `/examiner/login`.<br/>2. Enter registered credentials.<br/>3. Click Login. | HTTP 403 Forbidden; displays message: *"Your examiner account is pending approval by the administrator."* | Not Executed | Not Executed |
| **TC-AUTH-04** | Approved Examiner logs in successfully | Examiner account approved by Admin | 1. Navigate to `/examiner/login`.<br/>2. Enter credentials.<br/>3. Click Login. | HTTP 200 OK; JWT issued; redirected to `/examiner/dashboard`. | Not Executed | Not Executed |
| **TC-AUTH-05** | Admin logs in via seeded credentials | Admin seeder initialized `admin@example.com` | 1. Navigate to `/admin/login`.<br/>2. Enter `ADMIN_EMAIL` and `ADMIN_PASSWORD`.<br/>3. Click Login. | HTTP 200 OK; JWT token issued; redirected to `/admin/dashboard`. | Not Executed | Not Executed |
| **TC-AUTH-06** | Login with invalid password | Registered user exists | 1. Open login page.<br/>2. Enter correct email with wrong password.<br/>3. Submit. | HTTP 400 Bad Request; error message: *"Invalid email or password"*. | Not Executed | Not Executed |
| **TC-AUTH-07** | Login inputs mount empty without prefilled credentials | Fresh browser session | 1. Navigate to `/admin/login`, `/examiner/login`, `/aspirant/login`. | Both email and password fields are completely empty with correct placeholder text. | Not Executed | Not Executed |

---

## 4. MODULE 2: ROLE-BASED AUTHORIZATION & MIDDLEWARE TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-RBAC-01** | Aspirant blocked from Examiner routes | Logged in with `role: "aspirant"` | 1. Send `POST /api/quiz/create` using Aspirant Bearer token. | HTTP 403 Forbidden: *"Forbidden: Only examiners can access this resource."* | Not Executed | Not Executed |
| **TC-RBAC-02** | Examiner blocked from Admin routes | Logged in with `role: "examiner"` | 1. Send `GET /api/admin/stats` using Examiner Bearer token. | HTTP 403 Forbidden: *"Forbidden: Only admins can access this resource."* | Not Executed | Not Executed |
| **TC-RBAC-03** | Unauthenticated request rejected | No Bearer header supplied | 1. Send `GET /api/quiz/published` without Authorization header. | HTTP 401 Unauthorized: *"Access Denied: No authorization token provided"*. | Not Executed | Not Executed |
| **TC-RBAC-04** | Malformed / expired token rejected | Tampered or expired JWT token | 1. Send request with header `Authorization: Bearer invalidtoken123`. | HTTP 401 Unauthorized: *"Invalid or malformed token"*. | Not Executed | Not Executed |
| **TC-RBAC-05** | Real-time block revocation takes effect immediately | Active user possesses valid 24h JWT | 1. Admin sets `isBlocked: true` for user.<br/>2. User attempts any API call with existing valid token. | Middleware performs live DB query; denies request with HTTP 403: *"Your account has been blocked by the administrator."* | Not Executed | Not Executed |

---

## 5. MODULE 3: ADMINISTRATOR GOVERNANCE & APPROVAL TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-ADM-01** | Admin views aggregate dashboard stats | System contains users, quizzes, attempts | 1. Log in as Admin.<br/>2. Open `/admin/dashboard`. | Stats cards render exact counts for users, examiners, aspirants, quizzes, attempts, and communities. | Not Executed | Not Executed |
| **TC-ADM-02** | Admin approves pending examiner | Pending examiner exists in DB | 1. Navigate to `/admin/examiners/approvals`.<br/>2. Click "Approve" for examiner. | Examiner `approvalStatus` updates to `"approved"`; `approvedAt` and `approvedBy` populated; examiner can now log in. | Not Executed | Not Executed |
| **TC-ADM-03** | Admin rejects pending examiner | Pending examiner exists in DB | 1. Navigate to `/admin/examiners/approvals`.<br/>2. Click "Reject" for examiner. | Examiner `approvalStatus` updates to `"rejected"`; examiner login is permanently denied with HTTP 403. | Not Executed | Not Executed |
| **TC-ADM-04** | Admin blocks an active user | User is currently unblocked | 1. Navigate to `/admin/users`.<br/>2. Search for user and click "Block User". | User document updates to `isBlocked: true`; all active sessions terminated. | Not Executed | Not Executed |
| **TC-ADM-05** | Admin inspects full candidate attempt | Completed student attempt exists | 1. Navigate to `/admin/quizzes/:id`.<br/>2. Click on a student attempt. | Displays question-by-question candidate responses, correct answers, and timestamp. | Not Executed | Not Executed |
| **TC-ADM-06** | Admin updates password | Logged in as Admin | 1. Navigate to `/admin/profile`.<br/>2. Enter current password and new password.<br/>3. Submit. | Password hash updated in MongoDB; success notification displayed; old password rejected on next login. | Not Executed | Not Executed |

---

## 6. MODULE 4: EXAMINER QUIZ AUTHORING & VERSIONING TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-EXM-01** | Examiner creates public quiz draft | Approved Examiner logged in | 1. Navigate to `/examiner/create-quiz`.<br/>2. Enter Title, Category, Time Limit (30 min).<br/>3. Select Public access.<br/>4. Save. | Quiz document created with `isPublished: false`, `version: 1`, `communityId: null`. | Not Executed | Not Executed |
| **TC-EXM-02** | Examiner creates private quiz with code | Approved Examiner logged in | 1. Create quiz with `isPrivate: true` and `quizCode: "CODE88"`. | Quiz created with access code; not visible in public feed. | Not Executed | Not Executed |
| **TC-EXM-03** | Add MCQ questions to quiz | Quiz draft exists | 1. Open Question Builder.<br/>2. Enter question, 4 options, marks=2, select correct answer.<br/>3. Save. | Question document inserted with reference `quizId`; options array stored correctly. | Not Executed | Not Executed |
| **TC-EXM-04** | Edit and delete question | Question exists in quiz | 1. Modify option text via Edit modal.<br/>2. Delete second question. | Question document updated; deleted question removed from MongoDB. | Not Executed | Not Executed |
| **TC-EXM-05** | Publish quiz | Quiz has >= 1 question | 1. Click "Publish Quiz". | `isPublished` updated to `true`; quiz appears in Aspirant available list. | Not Executed | Not Executed |
| **TC-EXM-06** | Republish quiz increments version | Quiz already published with existing student attempts | 1. Modify question in published quiz.<br/>2. Click "Republish Quiz". | Quiz `version` increments to `2`; `lastRepublished` set to current timestamp; past attempts retain `quizVersion: 1`. | Not Executed | Not Executed |

---

## 7. MODULE 5: COLLABORATIVE COMMUNITY TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-COM-01** | Examiner creates public community | Approved Examiner logged in | 1. Navigate to `/examiner/communities`.<br/>2. Enter name, description, public visibility.<br/>3. Submit. | Community document created; unique `communityCode` generated; creator added to `CommunityMember` as `owner`. | Not Executed | Not Executed |
| **TC-COM-02** | Examiner creates private community with password | Approved Examiner logged in | 1. Enter name, private visibility, password: `"Pass123"`.<br/>2. Submit. | Community created with `password` field; requires password to join. | Not Executed | Not Executed |
| **TC-COM-03** | Aspirant joins public community | Public community exists | 1. Navigate to `/aspirant/discover-communities`.<br/>2. Click "Join Community". | User added to `CommunityMember` with `role: "student"`; `totalMembers` incremented by 1. | Not Executed | Not Executed |
| **TC-COM-04** | Aspirant joins private community with valid password | Private community exists | 1. Click "Join" on private community.<br/>2. Enter correct password.<br/>3. Submit. | Password validated; user successfully enrolled in community. | Not Executed | Not Executed |
| **TC-COM-05** | Aspirant fails to join private community with wrong password | Private community exists | 1. Click "Join".<br/>2. Enter incorrect password.<br/>3. Submit. | HTTP 400 Bad Request: *"Incorrect community password"*; membership not created. | Not Executed | Not Executed |

---

## 8. MODULE 6: ASPIRANT EXAM TAKING, TIMER & SCORING TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-ASP-01** | Discover and launch published quiz | Published quiz exists | 1. Navigate to `/aspirant/available-quizzes`.<br/>2. Click "Start Quiz". | Examination console loads with question palette and active countdown timer. | Not Executed | Not Executed |
| **TC-ASP-02** | Unlock private quiz with valid code | Private quiz with code `"CODE88"` exists | 1. Navigate to `/aspirant/private-quiz`.<br/>2. Enter code `"CODE88"`.<br/>3. Click Unlock. | Code validated; quiz loaded into active exam view. | Not Executed | Not Executed |
| **TC-ASP-03** | Countdown timer decrement | Exam session active | 1. Observe timer at top of screen for 60 seconds. | Timer decrements accurately second-by-second from `timeLimit * 60`. | Not Executed | Not Executed |
| **TC-ASP-04** | Automatic submission on timer expiry | Exam session active | 1. Allow countdown timer to reach `00:00`. | Examination triggers automatic submission; answers dispatched to backend without user interaction. | Not Executed | Not Executed |
| **TC-ASP-05** | Automated scoring calculation | 5 MCQ questions (2 marks each) | 1. Select 4 correct answers, 1 incorrect.<br/>2. Submit exam. | Backend scores 8/10 marks (80%); `Attempt` document saved with embedded answer correctness booleans. | Not Executed | Not Executed |
| **TC-ASP-06** | Immediate result display | `showResultImmediately: true` | 1. Submit quiz. | Scorecard displayed immediately showing score, percentage, and question breakdown. | Not Executed | Not Executed |
| **TC-ASP-07** | Single attempt constraint enforcement | `oneAttemptOnly: true`; student already submitted | 1. Attempt to launch the same quiz again. | System prevents starting exam; displays notification: *"You have already attempted this quiz."* | Not Executed | Not Executed |

---

## 9. MODULE 7: EXAMINER RESULTS & STUDENT REPORTS TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-RES-01** | Level 1: Quiz overview stats | Multiple students completed quiz | 1. Examiner opens `/examiner/results`. | Shows quiz title, total attempts, average score, and pass rate. | Not Executed | Not Executed |
| **TC-RES-02** | Level 2: Student roster per quiz | Quiz selected | 1. Click on quiz card. | Lists all students who attempted the quiz with individual scores and submission dates. | Not Executed | Not Executed |
| **TC-RES-03** | Level 3: Detailed student diagnostic report | Student attempt selected | 1. Click "View Report" for student. | Displays full question-by-question breakdown showing student choice vs correct answer. | Not Executed | Not Executed |
| **TC-RES-04** | Examiner deletes invalid attempt | Attempt exists | 1. Click "Delete Attempt" button on student report. | `Attempt` document removed from MongoDB; attempt count decremented. | Not Executed | Not Executed |

---

## 10. MODULE 8: AI EXPLANATION MICROSERVICE & CACHE TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AI-01** | AI Service health check | Python service running on `:8000` | 1. Send `GET http://localhost:8000/health`. | HTTP 200 OK: `{"status": "healthy", "service": "Online Quiz AI Explanation Service"}`. | Not Executed | Not Executed |
| **TC-AI-02** | On-demand AI explanation generation (First Request) | Attempt exists; no cached explanation | 1. Student opens completed attempt.<br/>2. Clicks "Explain with AI" on question. | Express forwards to FastAPI; returns 6-part educational breakdown in < 3.5s; saved in `AIExplanation` collection. | Not Executed | Not Executed |
| **TC-AI-03** | Cached AI explanation retrieval (Second Request) | Explanation already generated in DB | 1. Student clicks "Explain with AI" on same question again. | Express retrieves record from MongoDB cache; returns response in < 50ms without invoking FastAPI service. | Not Executed | Not Executed |
| **TC-AI-04** | AI microservice fallback resilience | External LLM API key absent/invalid | 1. Request explanation with unconfigured LLM keys. | Service uses educational rule-based engine; returns structured explanation without crashing or throwing HTTP 500. | Not Executed | Not Executed |
| **TC-AI-05** | Compound index prevents duplicate cache entries | Cache record exists | 1. Attempt manual concurrent inserts into `aiexplanations` with identical `{ attemptId, questionId, studentId }`. | MongoDB rejects duplicate with E11000 duplicate key error, preserving cache integrity. | Not Executed | Not Executed |

---

## 11. MODULE 9: INPUT VALIDATION & BOUNDARY ERROR HANDLING TEST CASES

| Test ID | Test Scenario | Preconditions | Steps to Execute | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-VAL-01** | Register with duplicate email | User with `jane@example.com` exists | 1. Submit registration with `jane@example.com`. | HTTP 400 Bad Request: *"Email already registered"*. | Not Executed | Not Executed |
| **TC-VAL-02** | Create quiz with negative time limit | Examiner logged in | 1. Submit quiz creation with `timeLimit: -10`. | Form validation rejects input; requires positive integer. | Not Executed | Not Executed |
| **TC-VAL-03** | Submit exam with empty answers array | Aspirant taking quiz | 1. Submit quiz without answering any questions. | Evaluates score as 0/TotalMarks; records attempt successfully without server error. | Not Executed | Not Executed |
| **TC-VAL-04** | Access non-existent quiz ID | Valid Aspirant token | 1. Send `GET /api/quiz/000000000000000000000000`. | HTTP 404 Not Found: *"Quiz not found"*. | Not Executed | Not Executed |
| **TC-VAL-05** | Password update with incorrect current password | Authenticated user | 1. Submit password update with wrong current password. | HTTP 400 Bad Request: *"Incorrect current password"*; password unchanged. | Not Executed | Not Executed |

---

## 12. DEFECT REPORTING & SEVERITY CLASSIFICATION

When tests are executed in future verification cycles, defects must be classified according to the following severity matrix:

* **Severity 1 (Critical):** System crash, security bypass, unauthorized privilege escalation, or database corruption.
* **Severity 2 (High):** Core functional defect with no workaround (e.g., scoring calculation error, timer failure).
* **Severity 3 (Medium):** Functional defect with an available workaround (e.g., filter dropdown glitch, cached data refresh delay).
* **Severity 4 (Low):** Minor UI styling, alignment, or cosmetic defect.
