# REST API SPECIFICATION AND ENDPOINT REFERENCE

## ONLINE QUIZ APPLICATION WITH MULTI-ROLE RBAC, COMMUNITIES, AND AI EXPLANATIONS

**Document Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**AI Microservice URL:** `http://localhost:8000`  
**Data Format:** `application/json`  
**Authentication Scheme:** `Authorization: Bearer <JWT_TOKEN>`  

---

## TABLE OF CONTENTS

1. [API Architecture & Conventions](#1-api-architecture--conventions)
2. [Module 1: Authentication Endpoints (`/api/auth`)](#2-module-1-authentication-endpoints-apiauth)
3. [Module 2: Administrator Management Endpoints (`/api/admin`)](#3-module-2-administrator-management-endpoints-apiadmin)
4. [Module 3: Quiz Authoring & Taking Endpoints (`/api/quiz`)](#4-module-3-quiz-authoring--taking-endpoints-apiquiz)
5. [Module 4: Question Management & Republishing Endpoints (`/api/manage`)](#5-module-4-question-management--republishing-endpoints-apimanage)
6. [Module 5: Examiner Results & Candidate Reports (`/api/results`)](#6-module-5-examiner-results--candidate-reports-apiresults)
7. [Module 6: Student Performance & Analytics (`/api/performance`)](#7-module-6-student-performance--analytics-apiperformance)
8. [Module 7: Community Collaboration Endpoints (`/api/community`)](#8-module-7-community-collaboration-endpoints-apicommunity)
9. [Module 8: Student Community Quizzes (`/api/student`)](#9-module-8-student-community-quizzes-apistudent)
10. [Module 9: User Profile & Security Settings (`/api/profile`)](#10-module-9-user-profile--security-settings-apiprofile)
11. [Module 10: AI Remediation Endpoints (`/api/ai`)](#11-module-10-ai-remediation-endpoints-apiai)
12. [Module 11: Python AI Microservice Endpoints](#12-module-11-python-ai-microservice-endpoints)
13. [Standard Error Codes & Responses](#13-standard-error-codes--responses)

---

## 1. API ARCHITECTURE & CONVENTIONS

* **Stateless Token Verification:** All protected routes require a valid JSON Web Token sent in the `Authorization: Bearer <token>` HTTP header.
* **Live Status Enforcement:** Protected endpoints verify active account status (`isBlocked === false`, `approvalStatus === "approved"`) on every request.
* **Standard Response Envelope:** Successful responses return standard JSON structures with descriptive payloads. Errors return `{ "message": "Error description" }`.

---

## 2. MODULE 1: AUTHENTICATION ENDPOINTS (`/api/auth`)

**Controller:** `backend/controllers/authController.js`

---

### 2.1 Register Aspirant
* **Method:** `POST`
* **Path:** `/api/auth/register/aspirant`
* **Auth Required:** No (Public)
* **Purpose:** Register a new student account with immediate activation.
* **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123"
}
```
* **Success Response (201 Created):**
```json
{
  "message": "Aspirant Registered Successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "65fc1234567890abcdef01",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "aspirant"
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: `{ "message": "All fields are required" }` or `{ "message": "Email already registered" }`

---

### 2.2 Register Examiner
* **Method:** `POST`
* **Path:** `/api/auth/register/examiner`
* **Auth Required:** No (Public)
* **Purpose:** Register a new examiner account in `pending` state requiring Admin approval.
* **Request Body:**
```json
{
  "name": "Prof. Alan Turing",
  "email": "turing@example.com",
  "password": "SecurePassword@123"
}
```
* **Success Response (201 Created):**
```json
{
  "message": "Registration successful! Your examiner account is pending approval by the administrator.",
  "user": {
    "id": "65fc1234567890abcdef02",
    "name": "Prof. Alan Turing",
    "email": "turing@example.com",
    "role": "examiner",
    "approvalStatus": "pending"
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: `{ "message": "Email already exists" }`

---

### 2.3 Login Aspirant
* **Method:** `POST`
* **Path:** `/api/auth/login/aspirant`
* **Auth Required:** No (Public)
* **Purpose:** Authenticate an aspirant and issue a JWT token.
* **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```
* **Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "65fc1234567890abcdef01",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "aspirant",
    "interests": ["Computer Science", "Mathematics"]
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: `{ "message": "Invalid email or password" }`
  * `403 Forbidden`: `{ "message": "Your account has been blocked by the administrator." }`

---

### 2.4 Login Examiner
* **Method:** `POST`
* **Path:** `/api/auth/login/examiner`
* **Auth Required:** No (Public)
* **Purpose:** Authenticate an approved examiner and issue a JWT token.
* **Request Body:**
```json
{
  "email": "turing@example.com",
  "password": "SecurePassword@123"
}
```
* **Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "65fc1234567890abcdef02",
    "name": "Prof. Alan Turing",
    "email": "turing@example.com",
    "role": "examiner",
    "approvalStatus": "approved"
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: `{ "message": "Invalid email or password" }`
  * `403 Forbidden`: `{ "message": "Your examiner account is pending approval by the administrator." }`
  * `403 Forbidden`: `{ "message": "Your examiner account request was rejected by the administrator." }`

---

### 2.5 Login Admin
* **Method:** `POST`
* **Path:** `/api/auth/login/admin`
* **Auth Required:** No (Public)
* **Purpose:** Authenticate system administrator.
* **Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword@123"
}
```
* **Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "65fc1234567890abcdef00",
    "name": "Administrator",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## 3. MODULE 2: ADMINISTRATOR MANAGEMENT ENDPOINTS (`/api/admin`)

**Controller:** `backend/controllers/adminController.js`  
**Security:** `verifyToken` + `adminOnly`

---

### 3.1 Get Dashboard Statistics
* **Method:** `GET` | **Path:** `/api/admin/stats`
* **Purpose:** Returns aggregate system metrics.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalExaminers": 15,
    "totalAspirants": 134,
    "pendingExaminers": 3,
    "totalQuizzes": 42,
    "totalPublishedQuizzes": 35,
    "totalAttempts": 520,
    "totalCommunities": 8,
    "recentActivity": []
  }
}
```

---

### 3.2 Get Pending Examiner Approvals
* **Method:** `GET` | **Path:** `/api/admin/examiners/approvals`
* **Purpose:** List examiners awaiting vetting.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "examiners": [
    {
      "_id": "65fc1234567890abcdef02",
      "name": "Prof. Alan Turing",
      "email": "turing@example.com",
      "approvalStatus": "pending",
      "createdAt": "2026-09-27T10:00:00.000Z"
    }
  ]
}
```

---

### 3.3 Update Examiner Approval Status
* **Method:** `PATCH` | **Path:** `/api/admin/examiners/:id/approval`
* **Request Body:**
```json
{
  "status": "approved" // or "rejected"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Examiner approved successfully",
  "examiner": {
    "_id": "65fc1234567890abcdef02",
    "name": "Prof. Alan Turing",
    "approvalStatus": "approved",
    "approvedAt": "2026-09-27T10:30:00.000Z"
  }
}
```

---

### 3.4 Get All Users / Toggle Block User
* **Method:** `GET` | **Path:** `/api/admin/users`
* **Method:** `PATCH` | **Path:** `/api/admin/users/:id/block`
* **Toggle Block Body:**
```json
{
  "isBlocked": true
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User has been blocked successfully",
  "user": {
    "_id": "65fc1234567890abcdef01",
    "name": "Jane Doe",
    "isBlocked": true
  }
}
```

---

### 3.5 Admin Community Oversight & Profile
* `GET /api/admin/communities`: Get all communities with search and visibility filter.
* `GET /api/admin/communities/:id`: Get deep community details, member list, and community quizzes.
* `GET /api/admin/quizzes`: Get all platform quizzes.
* `GET /api/admin/quizzes/:id`: Get full quiz details, question roster, and candidate attempts.
* `GET /api/admin/attempts/:id`: Inspect full candidate attempt audit log.
* `GET /api/admin/profile`: Get current admin account profile.
* `PUT /api/admin/profile/password`: Update administrator master password.

---

## 4. MODULE 3: QUIZ AUTHORING & TAKING ENDPOINTS (`/api/quiz`)

**Controller:** `backend/controllers/quizController.js`

---

### 4.1 Create Quiz
* **Method:** `POST` | **Path:** `/api/quiz/create`
* **Auth / Role:** `verifyToken` + `examiner`
* **Request Body:**
```json
{
  "title": "Data Structures & Algorithms Mock 1",
  "category": "Computer Science",
  "timeLimit": 30,
  "isPrivate": false,
  "quizCode": "",
  "shuffleQuestions": true,
  "oneAttemptOnly": true,
  "showResultImmediately": true,
  "communityId": null
}
```
* **Success Response (201 Created):**
```json
{
  "message": "Quiz Created Successfully",
  "quiz": {
    "_id": "65fc9876543210fedcba11",
    "title": "Data Structures & Algorithms Mock 1",
    "examinerId": "65fc1234567890abcdef02",
    "examinerName": "Prof. Alan Turing",
    "isPublished": false,
    "version": 1
  }
}
```

---

### 4.2 Add Question to Quiz
* **Method:** `POST` | **Path:** `/api/quiz/:quizId/question`
* **Auth / Role:** `verifyToken` + `examiner`
* **Request Body:**
```json
{
  "question": "What is the average time complexity of QuickSort?",
  "questionType": "MCQ",
  "options": ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
  "correctAnswer": "O(n log n)",
  "marks": 2
}
```
* **Success Response (201 Created):**
```json
{
  "message": "Question Added Successfully",
  "question": {
    "_id": "65fc9876543210fedcba22",
    "quizId": "65fc9876543210fedcba11",
    "question": "What is the average time complexity of QuickSort?",
    "options": ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
    "correctAnswer": "O(n log n)",
    "marks": 2
  }
}
```

---

### 4.3 Publish Quiz
* **Method:** `PUT` | **Path:** `/api/quiz/:quizId/publish`
* **Auth / Role:** `verifyToken` + `examiner`
* **Success Response (200 OK):**
```json
{
  "message": "Quiz Published Successfully",
  "quiz": {
    "_id": "65fc9876543210fedcba11",
    "isPublished": true,
    "version": 1
  }
}
```

---

### 4.4 Get Published Quizzes & Take Quiz
* `GET /api/quiz/published`: List all public published quizzes.
* `GET /api/quiz/:quizId`: Get quiz metadata and question list for taking.
* `POST /api/quiz/:quizId/verify`: Verify private `quizCode`.
* `POST /api/quiz/:quizId/submit`: Submit answers and evaluate exam.
  * **Submit Request Body:**
```json
{
  "answers": [
    {
      "questionId": "65fc9876543210fedcba22",
      "selectedAnswer": "O(n log n)"
    }
  ]
}
```
  * **Submit Response (200 OK):**
```json
{
  "message": "Quiz submitted successfully",
  "attemptId": "65fc9876543210fedcba99",
  "score": 2,
  "totalMarks": 2,
  "percentage": 100
}
```

---

## 5. MODULE 4: QUESTION MANAGEMENT & REPUBLISHING ENDPOINTS (`/api/manage`)

**Controller:** `backend/controllers/manageQuestionController.js`  
**Security:** `verifyToken` + `requireRole("examiner")`

* `GET /api/manage/quizzes`: List examiner's created quizzes.
* `GET /api/manage/quizzes/:quizId`: Get questions for a specific quiz.
* `PUT /api/manage/question/:questionId`: Update question text, options, correct answer, or marks.
* `DELETE /api/manage/question/:questionId`: Delete a question from a quiz.
* `POST /api/manage/question/:quizId`: Add an additional question.
* `PUT /api/manage/republish/:quizId`: Increment `version` and update `lastRepublished` date.

---

## 6. MODULE 5: EXAMINER RESULTS & CANDIDATE REPORTS (`/api/results`)

**Controller:** `backend/controllers/resultController.js`  
**Security:** `verifyToken` + `authorizeRole("examiner")`

* `GET /api/results/quizzes`: List examiner's quizzes with candidate submission counts and average scores.
* `GET /api/results/quiz/:quizId/students`: List all aspirants who attempted the specified quiz.
* `GET /api/results/quiz/:quizId/student/:studentId/attempts`: List all historical attempt records for a student on this quiz.
* `GET /api/results/quiz/:quizId/student/:studentId/report`: Generate deep question-by-question diagnostic report.

---

## 7. MODULE 6: STUDENT PERFORMANCE & ANALYTICS (`/api/performance`)

**Controller:** `backend/controllers/performanceController.js`  
**Security:** `verifyToken` + `requireRole("aspirant")`

* `GET /api/performance/`: List all historical exam attempts for the logged-in student with search, category filtering, and score breakdown.
* `GET /api/performance/:attemptId`: Retrieve detailed submission sheet for a single attempt, including per-question answers, correctness, and points.

---

## 8. MODULE 7: COMMUNITY COLLABORATION ENDPOINTS (`/api/community`)

**Controller:** `backend/controllers/communityController.js`

* `POST /api/community/create` (`examiner`): Create new community (`name`, `description`, `category`, `visibility`, `password`).
* `GET /api/community/`: List all accessible communities.
* `GET /api/community/my`: List communities created by or joined by the current user.
* `GET /api/community/discover`: Search and discover public/private communities.
* `POST /api/community/join`: Join a community by `communityCode` (and `password` if private).
* `GET /api/community/:id`: Get community overview and details.
* `GET /api/community/:id/quizzes`: Get quizzes hosted inside the community.
* `GET /api/community/:communityId/members` (`examiner`): Get community member roster.
* `PUT /api/community/:id` (`examiner`): Update community settings.
* `DELETE /api/community/:id` (`examiner`): Delete community.

---

## 9. MODULE 8: STUDENT COMMUNITY QUIZZES (`/api/student`)

**Controller:** `backend/controllers/studentController.js`  
**Security:** `verifyToken` + `authorizeRole("aspirant")`

* `GET /api/student/community-quizzes`: Fetch all published quizzes belonging to communities the student has joined.

---

## 10. MODULE 9: USER PROFILE & SECURITY SETTINGS (`/api/profile`)

**Controller:** `backend/controllers/profileController.js`  
**Security:** `verifyToken` (Any authenticated user)

* `GET /api/profile/`: Fetch profile of current logged-in user.
* `PUT /api/profile/password`: Update user password (requires `currentPassword` and `newPassword`).
* `PUT /api/profile/interests`: Update student subject interests array (`["Web Dev", "AI"]`).

---

## 11. MODULE 10: AI REMEDIATION ENDPOINTS (`/api/ai`)

**Controller:** `backend/controllers/aiController.js`  
**Security:** `verifyToken` + `authorizeRole("aspirant")`

---

### 11.1 Explain Question
* **Method:** `POST` | **Path:** `/api/ai/explain-question`
* **Purpose:** Generate or retrieve cached AI educational explanation.
* **Request Body:**
```json
{
  "attemptId": "65fc9876543210fedcba99",
  "questionId": "65fc9876543210fedcba22",
  "question": "What is the average time complexity of QuickSort?",
  "options": ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
  "studentAnswer": "O(n^2)",
  "correctAnswer": "O(n log n)",
  "isCorrect": false
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "cached": false,
  "explanation": {
    "_id": "65fc9876543210fedcba55",
    "attemptId": "65fc9876543210fedcba99",
    "questionId": "65fc9876543210fedcba22",
    "studentId": "65fc1234567890abcdef01",
    "questionExplanation": "The question asks for the expected mathematical run-time efficiency of the QuickSort algorithm across random input permutations.",
    "correctAnswerExplanation": "QuickSort divides the array into sub-arrays around a pivot. On average, the partition splits the problem in half, leading to log n levels of recursion with O(n) work per level, resulting in O(n log n).",
    "studentAnswerExplanation": "You selected O(n^2). While O(n^2) is the worst-case complexity (occurring when the pivot is always the smallest/largest element), the average case is O(n log n).",
    "conceptExplanation": "Divide-and-conquer sorting algorithms achieve O(n log n) by partitioning and recursively solving independent sub-problems.",
    "example": "// QuickSort partition\nint partition(int arr[], int low, int high) {\n  int pivot = arr[high];\n  // ...\n}",
    "learningTip": "Remember: QuickSort average is O(n log n), worst-case is O(n^2) when bad pivots are chosen.",
    "provider": "openai"
  }
}
```

---

### 11.2 Get All Explanations for Attempt
* **Method:** `GET` | **Path:** `/api/ai/explanations/:attemptId`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "explanations": [ /* Array of cached explanation documents */ ]
}
```

---

## 12. MODULE 11: PYTHON AI MICROSERVICE ENDPOINTS

**Server:** FastAPI on `http://localhost:8000`

### 12.1 Health Check
* **Method:** `GET` | **Path:** `/health`
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "Online Quiz AI Explanation Service",
  "version": "1.0.0"
}
```

### 12.2 Generate Question Explanation
* **Method:** `POST` | **Path:** `/explain-question`
* **Request Body:**
```json
{
  "question": "What is polymorphism in OOP?",
  "options": ["One interface, multiple implementations", "Hiding internal data", "Reusing code via inheritance"],
  "studentAnswer": "Hiding internal data",
  "correctAnswer": "One interface, multiple implementations",
  "isCorrect": false
}
```
* **Response (200 OK):** Returns structured JSON conforming to `ExplainQuestionResponse`.

---

## 13. STANDARD ERROR CODES & RESPONSES

| Status Code | Reason Phrase | Typical Cause | Response Example |
| :---: | :--- | :--- | :--- |
| **400** | Bad Request | Missing required body fields, duplicate email | `{ "message": "All fields are required" }` |
| **401** | Unauthorized | Missing or expired JWT token | `{ "message": "Access Denied: No authorization token provided" }` |
| **403** | Forbidden | Insufficient role, account blocked, or pending approval | `{ "message": "Forbidden: Only examiners can access this resource." }` |
| **404** | Not Found | Resource ID does not match any record | `{ "message": "Quiz not found" }` |
| **500** | Internal Server Error | Unhandled runtime exception or DB disconnect | `{ "message": "Server error", "error": "Details" }` |
