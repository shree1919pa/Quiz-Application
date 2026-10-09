# USER MANUAL AND OPERATIONAL WORKFLOW GUIDE

## ONLINE QUIZ APPLICATION WITH MULTI-ROLE RBAC, COMMUNITIES, AND AI EXPLANATIONS

**Document Version:** 1.0.0  
**Target Roles:** Administrator, Examiner (Educator), Aspirant (Student)  

---

## TABLE OF CONTENTS

1. [Introduction & Role Overview](#1-introduction--role-overview)
2. [Role 1: Administrator Operations](#2-role-1-administrator-operations)
   * 2.1 [Admin Login & Authentication](#21-admin-login--authentication)
   * 2.2 [Dashboard Metrics & Activity Monitoring](#22-dashboard-metrics--activity-monitoring)
   * 2.3 [Examiner Approval & Rejection Workflow](#23-examiner-approval--rejection-workflow)
   * 2.4 [User Directory & Instant Account Blocking](#24-user-directory--instant-account-blocking)
   * 2.5 [Platform Quiz & Candidate Attempt Oversight](#25-platform-quiz--candidate-attempt-oversight)
   * 2.6 [Community Oversight & Member Audit](#26-community-oversight--member-audit)
   * 2.7 [Admin Profile & Password Update](#27-admin-profile--password-update)
3. [Role 2: Examiner Operations](#3-role-2-examiner-operations)
   * 3.1 [Examiner Registration & Pending Approval State](#31-examiner-registration--pending-approval-state)
   * 3.2 [Examiner Login & Dashboard Navigation](#32-examiner-login--dashboard-navigation)
   * 3.3 [Creating a New Quiz (Public & Private)](#33-creating-a-new-quiz-public--private)
   * 3.4 [Adding & Managing Questions (MCQ & Theory)](#34-adding--managing-questions-mcq--theory)
   * 3.5 [Publishing & Versioned Republishing](#35-publishing--versioned-republishing)
   * 3.6 [Collaborative Community Creation & Management](#36-collaborative-community-creation--management)
   * 3.7 [Candidate Submission Reports & Analytics](#37-candidate-submission-reports--analytics)
4. [Role 3: Aspirant (Student) Operations](#4-role-3-aspirant-student-operations)
   * 4.1 [Aspirant Registration & Login](#41-aspirant-registration--login)
   * 4.2 [Selecting Academic Interests & Dashboard Feed](#42-selecting-academic-interests--dashboard-feed)
   * 4.3 [Exploring & Unlocking Quizzes (Public & Passcode)](#43-exploring--unlocking-quizzes-public--passcode)
   * 4.4 [Discovering & Joining Communities](#44-discovering--joining-communities)
   * 4.5 [Taking a Timed Quiz & Automatic Submission](#45-taking-a-timed-quiz--automatic-submission)
   * 4.6 [Instant Scorecards & Performance Analytics](#46-instant-scorecards--performance-analytics)
   * 4.7 [Requesting On-Demand AI Educational Explanations](#47-requesting-on-demand-ai-educational-explanations)
   * 4.8 [Profile & Password Settings](#48-profile--password-settings)
5. [Logout & Session Security](#5-logout--session-security)

---

## 1. INTRODUCTION & ROLE OVERVIEW

The **Online Quiz Application** provides tailored, role-specific web interfaces for three primary classes of users:
* **Administrator:** Oversees platform integrity, validates examiner requests, blocks abusive accounts, audits exams/communities, and manages master credentials.
* **Examiner:** Authors customizable quizzes, manages MCQ/theory questions, creates collaborative communities, and evaluates student submission metrics.
* **Aspirant (Student):** Enrolls in communities, solves timed quizzes, reviews detailed scorecards, tracks personal growth, and remediates conceptual errors via AI tutoring.

---

## 2. ROLE 1: ADMINISTRATOR OPERATIONS

### 2.1 Admin Login & Authentication
1. Open your web browser and navigate to `/admin/login` (e.g., `http://localhost:5173/admin/login`).
2. Notice that the **Email** and **Password** input fields are empty with clean placeholder text.
3. Enter your configured administrator credentials:
   * **Email:** `admin@example.com` (or your configured `ADMIN_EMAIL`)
   * **Password:** `AdminSecurePassword@123` (or your configured `ADMIN_PASSWORD`)
4. Click **Login as Administrator**.
5. Upon successful authentication, the system redirects you to the `/admin/dashboard`.

---

### 2.2 Dashboard Metrics & Activity Monitoring
1. Once inside the **Admin Dashboard**, review the real-time statistics cards:
   * **Total Users:** Aggregate count of all registered platform accounts.
   * **Active Examiners:** Approved educators authoring content.
   * **Pending Approvals:** Registration requests awaiting admin action.
   * **Total Quizzes & Published Exams:** Global assessment volume.
   * **Total Student Attempts:** Total number of tests submitted.
   * **Active Communities:** Total collaborative educator/student hubs.
2. Use the top navigation bar to switch between **Dashboard**, **Examiner Approvals**, **User Management**, **Quiz Management**, **Community Management**, and **Profile Settings**.

---

### 2.3 Examiner Approval & Rejection Workflow
1. Click **Examiner Approvals** in the navigation bar (`/admin/examiners/approvals`).
2. Review the list of educators currently in `pending` status. The table displays their **Name**, **Email**, and **Registration Date**.
3. **To Approve an Examiner:**
   * Click the green **Approve** button next to the examiner's record.
   * The status updates immediately to `approved`, allowing the educator to log in and author content.
4. **To Reject an Examiner:**
   * Click the red **Reject** button.
   * The status updates to `rejected`, and subsequent login attempts by the examiner will be denied.

---

### 2.4 User Directory & Instant Account Blocking
1. Click **User Management** in the navigation bar (`/admin/users`).
2. Use the search bar to search users by name or email, or filter by role (`admin`, `examiner`, `aspirant`).
3. **To Block a Compromised or Malicious User:**
   * Locate the user and click the **Block User** toggle button.
   * The user's `isBlocked` flag is updated to `true`.
   * Any subsequent request made by that user is immediately rejected with HTTP 403, effectively terminating their active session.
4. **To Restore Access:**
   * Click the **Unblock** toggle button to restore standard permissions.

---

### 2.5 Platform Quiz & Candidate Attempt Oversight
1. Click **Quiz Management** (`/admin/quizzes`).
2. View all platform quizzes across all examiners.
3. Click on any quiz title to open **Admin Quiz Details** (`/admin/quizzes/:id`):
   * Inspect all question items, choices, correct answers, and assigned marks.
   * Review all student submissions recorded for this quiz.
4. Click on a specific candidate attempt to view the **Attempt Audit Log** (`/admin/attempts/:id`), displaying the student's selected answers, score breakdown, and time of submission.

---

### 2.6 Community Oversight & Member Audit
1. Click **Community Management** (`/admin/communities`).
2. Browse all active public and private communities.
3. Click on a community to open **Admin Community Details** (`/admin/communities/:id`):
   * View the community owner, description, visibility, and total member count.
   * Inspect the complete member roster with joined dates and assigned roles (`owner`, `contributor`, `student`).
   * View all quizzes hosted exclusively within the community.

---

### 2.7 Admin Profile & Password Update
1. Click **Profile** (`/admin/profile`).
2. View administrator account details.
3. To update the master password:
   * Enter your **Current Password**.
   * Enter your **New Password** (minimum 6 characters with mixed characters recommended).
   * Confirm the new password and click **Update Password**.
4. A success toast confirms that the password hash in the database has been updated.

---

## 3. ROLE 2: EXAMINER OPERATIONS

### 3.1 Examiner Registration & Pending Approval State
1. Navigate to `/examiner/register` on the web portal.
2. Fill in your **Full Name**, **Institutional Email**, and a secure **Password**.
3. Click **Register as Examiner**.
4. The system displays a confirmation notice:  
   > *"Registration successful! Your examiner account is pending approval by the administrator."*
5. If you attempt to log in prior to approval, the login screen will notify you that your account is awaiting admin verification.

---

### 3.2 Examiner Login & Dashboard Navigation
1. Once approved by the administrator, navigate to `/examiner/login`.
2. Enter your registered email and password, then click **Login**.
3. The **Examiner Dashboard** (`/examiner/dashboard`) opens, presenting:
   * Quick action buttons: **Create New Quiz**, **Manage Quizzes**, **My Communities**, **View Results**.
   * Recent quiz performance summary.

---

### 3.3 Creating a New Quiz (Public & Private)
1. In the Examiner Dashboard, click **Create Quiz** (`/examiner/create-quiz`).
2. Fill out the **Quiz Configuration Form**:
   * **Quiz Title:** (e.g., *"Database Management Systems - Midterm"*)
   * **Category:** Select subject (e.g., Computer Science, Mathematics, General Knowledge).
   * **Time Limit:** Enter exam duration in minutes (e.g., `30`).
   * **Access Type:** Select **Public** (available to all aspirants) or **Private** (requires passcode).
   * **Private Quiz Code:** If private, specify or generate a 6-character access code.
   * **Host Community:** (Optional) Select a community you own to restrict the quiz to community members.
   * **Configuration Toggles:**
     * `Shuffle Questions`: Randomizes question sequence for each aspirant.
     * `One Attempt Only`: Restricts aspirants to a single submission.
     * `Show Result Immediately`: Displays the score upon submission.
3. Click **Proceed to Question Builder**.

---

### 3.4 Adding & Managing Questions (MCQ & Theory)
1. In the **Question Builder Studio** (`/examiner/quiz/:quizId/questions`):
2. **To Add a Multiple Choice Question (MCQ):**
   * Select question type **MCQ**.
   * Enter the **Question Statement**.
   * Add 2 to 6 **Option Choices**.
   * Select the radio button corresponding to the **Correct Answer**.
   * Assign point weight in the **Marks** field (e.g., `2`).
   * Click **Save Question**.
3. Repeat the process to add all required questions.
4. **To Edit or Delete Questions:**
   * Navigate to **Manage Questions** (`/examiner/manage-questions`).
   * Select the quiz to view all existing questions.
   * Click the **Edit (Pencil)** icon to modify question text or options.
   * Click the **Delete (Trash)** icon to remove an unwanted question.

---

### 3.5 Publishing & Versioned Republishing
1. Once all questions have been added, click **Publish Quiz**.
2. The quiz status changes to `isPublished: true`, making it live for students.
3. **Republishing an Edited Quiz:**
   * If you edit questions on a live quiz, click **Republish Quiz**.
   * The system automatically increments the quiz `version` counter and timestamps `lastRepublished`.
   * Past student submissions remain preserved and linked to their original version.

---

### 3.6 Collaborative Community Creation & Management
1. Navigate to **Communities** (`/examiner/communities`).
2. Click **Create Community**:
   * Enter **Community Name** and **Description**.
   * Select **Visibility** (`public` or `private`).
   * If private, enter an access **Password**.
3. Click **Create Community**. A unique 6-character `communityCode` is generated.
4. Share the code with peer examiners or students.
5. In **Community Details**, view enrolled members, assign contributor roles, or host community-scoped mock exams.

---

### 3.7 Candidate Submission Reports & Analytics
1. Navigate to **Quiz Results** (`/examiner/results`).
2. **Level 1 (Quiz Overview):** View all your quizzes with total attempts, average score, and pass rate.
3. **Level 2 (Student Roster):** Click on a quiz to view the list of aspirants who took the exam, showing student name, email, score, percentage, and submission timestamp.
4. **Level 3 (Diagnostic Report):** Click on any student's attempt to view their **Detailed Report**:
   * Inspect each question, the student's selected option, the correct answer, and points awarded.
   * Use the **Delete Attempt** button if a submission needs to be invalidated due to technical or invigilation issues.

---

## 4. ROLE 3: ASPIRANT (STUDENT) OPERATIONS

### 4.1 Aspirant Registration & Login
1. Navigate to `/aspirant/register`.
2. Enter your **Name**, **Email**, and **Password**, then click **Create Account**.
3. Your account is activated instantly without requiring administrative vetting.
4. To log in, go to `/aspirant/login`, enter your credentials, and click **Login**.

---

### 4.2 Selecting Academic Interests & Dashboard Feed
1. Upon your first login, you are prompted to select your **Academic Interests** (e.g., *Computer Science, Web Development, Mathematics, Aptitude*).
2. You can update these interests at any time in **Select Interests** (`/aspirant/select-interests`).
3. The **Aspirant Dashboard** (`/aspirant/dashboard`) displays personalized quiz recommendations matching your selected topics.

---

### 4.3 Exploring & Unlocking Quizzes (Public & Passcode)
1. Navigate to **Available Quizzes** (`/aspirant/available-quizzes`).
2. Filter quizzes by category or search by keywords.
3. **To Access a Private Quiz:**
   * Click the **Private Quiz** tab (`/aspirant/private-quiz`).
   * Enter the 6-character `quizCode` provided by your instructor.
   * Click **Unlock Quiz** to load the assessment.

---

### 4.4 Discovering & Joining Communities
1. Navigate to **Discover Communities** (`/aspirant/discover-communities`).
2. Browse public communities and click **Join Community** to enroll instantly.
3. For private communities, click **Join**, enter the required community password, and submit.
4. Go to **My Communities** (`/aspirant/my-communities`) to access community discussions and community-exclusive mock tests.

---

### 4.5 Taking a Timed Quiz & Automatic Submission
1. Click **Start Quiz** on any authorized assessment card.
2. The **Examination Console** (`/aspirant/attempt/:quizId`) opens:
   * **Countdown Timer:** An active timer at the top right displays the remaining time.
   * **Question Palette:** Displays question statements, point values, and selectable options.
3. Select your answer for each question.
4. **Exam Submission:**
   * **Manual Submit:** When finished, click **Submit Exam** and confirm.
   * **Automatic Timer Expiry:** If the countdown reaches `00:00`, the exam interface automatically captures your responses and submits them immediately.

---

### 4.6 Instant Scorecards & Performance Analytics
1. Upon submission, if `showResultImmediately` is enabled, your **Scorecard** appears immediately:
   * **Score:** Total points earned vs. total available marks.
   * **Percentage:** Final percentage grade.
   * **Question Breakdown:** Green indicators for correct answers, red indicators for incorrect choices.
2. Navigate to **My Performance** (`/aspirant/my-performance`) to view your historical score trend chart, total tests taken, and category-wise performance.

---

### 4.7 Requesting On-Demand AI Educational Explanations
1. In your **Performance Details** view (`/aspirant/performance/:attemptId`), review any completed test.
2. Locate a question you answered incorrectly or wish to understand more deeply.
3. Click the **Explain with AI** button.
4. The system communicates with the AI microservice and renders a structured 6-part educational breakdown:
   * 🎯 **Question Objective:** What the problem was asking.
   * ✅ **Why the Correct Answer is Right:** Conceptual justification.
   * ❌ **Why Your Answer was Incorrect:** Direct diagnosis of the misconception.
   * 💡 **Core Theory:** Fundamental concept underlying the topic.
   * 💻 **Practical Example / Code Snippet:** Illustrative application.
   * 🧠 **Learning Tip / Mnemonic:** Retention trick for future exams.
5. The explanation is cached; reopening it in the future loads instantaneously.

---

### 4.8 Profile & Password Settings
1. Navigate to **Profile** (`/aspirant/profile`).
2. View your registration details and enrolled communities.
3. Update your login password by providing your current password and entering a new secure password.

---

## 5. LOGOUT & SESSION SECURITY

* To terminate your session safely, click the **Logout** button located in the top navigation bar of any dashboard.
* The system clears the JWT authentication token from local storage and redirects you to the login screen.
* Always log out when using public or shared computers.
