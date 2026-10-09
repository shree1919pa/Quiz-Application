# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## ONLINE QUIZ APPLICATION WITH ROLE-BASED ACCESS CONTROL, COMMUNITIES, AND AI EXPLANATIONS

**Document Version:** 1.0.0  
**Status:** Approved / Active Baseline  
**Prepared For:** Academic & Engineering Project Evaluation  
**System Architecture:** MERN Stack (MongoDB, Express.js, React 19, Node.js) + Python FastAPI AI Microservice  

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
   * 1.1 [Purpose](#11-purpose)
   * 1.2 [Scope](#12-scope)
   * 1.3 [Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   * 1.4 [References](#14-references)
   * 1.5 [Overview](#15-overview)
2. [Overall System Description](#2-overall-system-description)
   * 2.1 [Product Perspective](#21-product-perspective)
   * 2.2 [User Classes and Characteristics](#22-user-classes-and-characteristics)
   * 2.3 [Operating Environment](#23-operating-environment)
   * 2.4 [Design and Implementation Constraints](#24-design-and-implementation-constraints)
   * 2.5 [User Documentation](#25-user-documentation)
   * 2.6 [Assumptions and Dependencies](#26-assumptions-and-dependencies)
3. [External Interface Requirements](#3-external-interface-requirements)
   * 3.1 [User Interfaces (UI)](#31-user-interfaces-ui)
   * 3.2 [Hardware Interfaces](#32-hardware-interfaces)
   * 3.3 [Software Interfaces](#33-software-interfaces)
   * 3.4 [Communications Interfaces](#34-communications-interfaces)
4. [System Features & Functional Requirements](#4-system-features--functional-requirements)
   * 4.1 [Module 1: Authentication & Authorization (FR-AUTH)](#41-module-1-authentication--authorization-fr-auth)
   * 4.2 [Module 2: Administrator Governance (FR-ADM)](#42-module-2-administrator-governance-fr-adm)
   * 4.3 [Module 3: Examiner & Quiz Authoring (FR-EXM)](#43-module-3-examiner--quiz-authoring-fr-exm)
   * 4.4 [Module 4: Aspirant & Examination Engine (FR-ASP)](#44-module-4-aspirant--examination-engine-fr-asp)
   * 4.5 [Module 5: Collaborative Communities (FR-COM)](#45-module-5-collaborative-communities-fr-com)
   * 4.6 [Module 6: Results, Reports & Analytics (FR-RES)](#46-module-6-results-reports--analytics-fr-res)
   * 4.7 [Module 7: AI-Powered Question Remediation (FR-AI)](#47-module-7-ai-powered-question-remediation-fr-ai)
5. [Non-Functional Requirements (NFR)](#5-non-functional-requirements-nfr)
   * 5.1 [Performance Requirements (NFR-PERF)](#51-performance-requirements-nfr-perf)
   * 5.2 [Security Requirements (NFR-SEC)](#52-security-requirements-nfr-sec)
   * 5.3 [Reliability and Availability Requirements (NFR-REL)](#53-reliability-and-availability-requirements-nfr-rel)
   * 5.4 [Usability and Accessibility Requirements (NFR-USA)](#54-usability-and-accessibility-requirements-nfr-usa)
   * 5.5 [Maintainability and Portability Requirements (NFR-MNT)](#55-maintainability-and-portability-requirements-nfr-mnt)
6. [Database Requirements](#6-database-requirements)
7. [Acceptance Criteria](#7-acceptance-criteria)

---

## 1. INTRODUCTION

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to provide a complete, rigorous, and unambiguous description of the software requirements for the **Online Quiz Application**. This document serves as the primary technical contract between developers, system architects, project guides, and academic evaluators. It outlines the functional behavior, performance metrics, security guarantees, external interfaces, and database constraints of the system.

### 1.2 Scope
The **Online Quiz Application** is a full-stack web-based evaluation and learning platform built on the MERN stack with an integrated Python FastAPI AI explanation microservice. 
The software facilitates:
* End-to-end administration of digital assessments for academic institutions and competitive training centers.
* Three-tier Role-Based Access Control (RBAC) separating **Administrators**, **Examiners (Educators)**, and **Aspirants (Students)**.
* Automated administrative vetting of newly registered examiners and real-time blocking of compromised accounts.
* Creation, editing, versioning, and publishing of timed Multiple Choice (MCQ) and Theory quizzes with private access codes.
* Management of public and private educational communities.
* Synchronized exam execution with countdown timers, automatic submission, and instant scoring.
* In-depth candidate analytics for examiners and longitudinal performance tracking for aspirants.
* Context-aware, multi-part AI educational explanations with persistent caching.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term / Acronym | Definition |
| :--- | :--- |
| **API** | Application Programming Interface (RESTful over HTTP/HTTPS) |
| **Bcrypt** | Password-hashing function based on the Blowfish cipher |
| **CBT** | Computer-Based Testing |
| **CORS** | Cross-Origin Resource Sharing |
| **CRUD** | Create, Read, Update, Delete operations |
| **DOM** | Document Object Model |
| **HMR** | Hot Module Replacement (Vite development feature) |
| **JWT** | JSON Web Token (RFC 7519) |
| **LLM** | Large Language Model (e.g., OpenAI, Groq, Google Gemini) |
| **MERN** | MongoDB, Express.js, React, Node.js |
| **ODM** | Object Data Modeling (Mongoose) |
| **RBAC** | Role-Based Access Control |
| **SPA** | Single Page Application (React 19) |
| **SRS** | Software Requirements Specification (IEEE 830 standard) |
| **UI / UX** | User Interface / User Experience |
| **UUID** | Universally Unique Identifier |

### 1.4 References
* IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
* RFC 7519: *JSON Web Token (JWT)*.
* React 19 Documentation: *React Declarative Component Model*.
* Express 5.x Specification: *Fast, unopinionated, minimalist web framework for Node.js*.
* Mongoose 9.x Schema API Documentation.
* FastAPI Framework v0.100+ Specification.

### 1.5 Overview
The subsequent sections detail the overall system perspective, user hierarchies, operating environments, precise functional requirements tagged with unique identifiers (`FR-XX-YY`), non-functional criteria (`NFR-XX-YY`), interface contracts, and formal acceptance criteria.

---

## 2. OVERALL SYSTEM DESCRIPTION

### 2.1 Product Perspective
The Online Quiz Application is an independent, self-contained client-server web platform augmented by an asynchronous AI microservice. It replaces manual, paper-heavy, or fragmented quiz systems by centralizing creation, moderation, proctoring, evaluation, and learning remediation in a single portal.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|        React 19 Single Page Application (Hosted on Vite Dev/Build)      |
+-------------------------------------------------------------------------+
                                    |
                             HTTP / REST (JSON)
                                    v
+-------------------------------------------------------------------------+
|                            APPLICATION TIER                             |
|               Express.js 5.x REST API Engine (Node.js v18+)             |
|   [JWT Auth Middleware] -> [RBAC / Live DB Check] -> [Controllers]     |
+-------------------------------------------------------------------------+
             |                                              |
      Mongoose Connection                           Internal HTTP/REST
             v                                              v
+-----------------------------+             +-----------------------------+
|        DATABASE TIER        |             |     AI MICROSERVICE TIER    |
|   MongoDB Database (v6/v7)  |             |  Python FastAPI (Port 8000) |
+-----------------------------+             +-----------------------------+
```

### 2.2 User Classes and Characteristics

The system defines three mutually exclusive primary user classes:

1. **Administrator (`admin`):**
   * *Technical Expertise:* High.
   * *Responsibilities:* System governance, approving/rejecting examiner registration requests, monitoring all users, blocking/unblocking accounts, inspecting quizzes and attempt logs across the entire platform, overseeing communities, and maintaining administrative security settings.
2. **Examiner (`examiner`):**
   * *Technical Expertise:* Moderate.
   * *Responsibilities:* Creating quizzes, configuring evaluation parameters, authoring questions, publishing/republishing quizzes, establishing collaborative communities, inviting co-examiners, and analyzing student performance reports.
   * *Constraint:* New accounts remain in a `pending` state until verified and approved by an Administrator.
3. **Aspirant / Student (`aspirant`):**
   * *Technical Expertise:* General web user.
   * *Responsibilities:* Discovering available quizzes, joining public and private communities, taking timed assessments, reviewing scorecards, tracking personal performance trends, and requesting AI explanations for incorrect/unclear answers.

### 2.3 Operating Environment
* **Server Operating System:** Windows Server / Windows 10/11, Linux (Ubuntu 20.04+ LTS), or macOS 12+.
* **Web Server / Runtime:** Node.js `v18.0.0` or higher (`v20.x` LTS recommended).
* **AI Runtime:** Python `3.10.x` or `3.11.x` running Uvicorn ASGI server.
* **Database Management System:** MongoDB Community Server `v6.0+` / `v7.0+` or MongoDB Atlas Cloud.
* **Client Web Browsers:** Google Chrome `v100+`, Mozilla Firefox `v100+`, Microsoft Edge `v100+`, Safari `v15+`.

### 2.4 Design and Implementation Constraints
1. **Stateless API:** Express backend must remain stateless, verifying authorization via JWT headers.
2. **Dynamic DB Verification:** Although tokens are cryptographically verified, the system must query MongoDB on every protected request to enforce `isBlocked` and `approvalStatus` in real time.
3. **Vanilla CSS Architecture:** UI styling must utilize a custom Vanilla CSS design system without external heavy utility frameworks like Tailwind unless requested.
4. **Data Isolation:** Private quizzes and private communities must remain inaccessible to unauthorized aspirants without valid passcodes.
5. **Idempotent AI Caching:** AI explanations must be generated once per question attempt and persistently cached using a unique compound index `{ attemptId, questionId, studentId }`.

### 2.5 User Documentation
The system provides a comprehensive documentation suite inside the `docs/` repository, comprising:
* System Architecture and Component Models (`System_Architecture.md`)
* Database Design and ER Models (`Database_Design.md`)
* REST API Reference Guide (`API_Documentation.md`)
* Installation and Deployment Manual (`Installation_Guide.md`)
* Role-Specific User Manual (`User_Manual.md`)
* Test Execution Suite (`Testing_Documentation.md`)
* Maintenance and Operations Guide (`Maintenance_Guide.md`)

### 2.6 Assumptions and Dependencies
* The host machine has network connectivity to download Node.js packages (`npm`) and Python dependencies (`pip`).
* The system assumes an active MongoDB service running locally on `localhost:27017` or accessible via a remote connection string (`MONGO_URI`).
* Optional LLM features depend on valid API keys (`OPENAI_API_KEY`, `GROQ_API_KEY`, or `GEMINI_API_KEY`); in their absence, the microservice falls back to its built-in rule-based educational generator.

---

## 3. EXTERNAL INTERFACE REQUIREMENTS

### 3.1 User Interfaces (UI)
* **Design Aesthetic:** Modern glassmorphism, responsive grid/flexbox layouts, deep dark/indigo theme palettes, dynamic micro-interactions, and accessible typography (Inter / Outfit / system font stack).
* **Login Views:** Dedicated, clean login interfaces for Aspirant (`/aspirant/login`), Examiner (`/examiner/login`), and Admin (`/admin/login`) with explicitly cleared input fields and no prefilled hardcoded credentials.
* **Dashboard Layouts:**
  * *Admin:* Top navigation with system statistics cards, searchable user table, pending approvals table, community oversight grid, and quiz audit view.
  * *Examiner:* Sidebar navigation with active quiz cards, question builder modals, community management tabs, and hierarchical student performance drill-downs.
  * *Aspirant:* Recommended quiz feed, subject interest tags, community explorer, full-screen examination console with countdown timer, and interactive result breakdown.

### 3.2 Hardware Interfaces
* Standard mouse/keyboard input devices and touch screens for mobile/tablet devices.
* Display support for resolutions ranging from 360px (mobile viewport) up to 4K desktop monitors.

### 3.3 Software Interfaces
* **Node.js / Express API:** REST API exposing endpoints over HTTP on port 5000 (configurable via `PORT`).
* **Python FastAPI Service:** Asynchronous microservice running on port 8000 exposing `/health` and `/explain-question`.
* **MongoDB Database:** Communicates over TCP via Mongoose ODM on port 27017.

### 3.4 Communications Interfaces
* Communication between Client and Server occurs over standard HTTP/1.1 or HTTP/2 using JSON payloads (`application/json`).
* Authorization headers follow the Bearer token standard: `Authorization: Bearer <JWT_TOKEN>`.
* Cross-Origin Resource Sharing (CORS) configured to permit frontend origins (`http://localhost:5173`, `http://localhost:5174`, `http://localhost:3000`).

---

## 4. SYSTEM FEATURES & FUNCTIONAL REQUIREMENTS

### 4.1 Module 1: Authentication & Authorization (FR-AUTH)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-AUTH-01** | The system shall allow Aspirants to register with `name`, `email`, and `password`. The account shall be activated immediately with role `aspirant`. | Critical | Aspirant |
| **FR-AUTH-02** | The system shall allow Examiners to register with `name`, `email`, and `password`. The account shall be created with role `examiner` and `approvalStatus: "pending"`. | Critical | Examiner |
| **FR-AUTH-03** | The system shall securely hash all passwords using `bcryptjs` with a minimum salt factor of 10 prior to database insertion. | Critical | All |
| **FR-AUTH-04** | The system shall authenticate users against their registered role endpoint (`/login/aspirant`, `/login/examiner`, `/login/admin`) and issue a signed JWT upon valid credentials. | Critical | All |
| **FR-AUTH-05** | The system shall reject login attempts for Examiner accounts whose `approvalStatus` is `"pending"` or `"rejected"`, returning HTTP 403 with an informative message. | High | Examiner |
| **FR-AUTH-06** | The system shall reject login attempts and terminate active sessions for any user whose `isBlocked` flag is set to `true`, returning HTTP 403. | Critical | All |
| **FR-AUTH-07** | The system shall automatically seed and synchronize a master Administrator account from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) on server startup. | Critical | Admin |

### 4.2 Module 2: Administrator Governance (FR-ADM)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-ADM-01** | The system shall provide the Admin with real-time aggregate statistics, including total users, examiners, aspirants, quizzes, completed attempts, and communities. | High | Admin |
| **FR-ADM-02** | The system shall provide a dedicated interface to view all pending examiner registration requests. | Critical | Admin |
| **FR-ADM-03** | The system shall allow the Admin to approve (`approvalStatus: "approved"`) or reject (`approvalStatus: "rejected"`) pending examiners, recording the timestamp and admin ID. | Critical | Admin |
| **FR-ADM-04** | The system shall provide a searchable and filterable directory of all registered users across all roles. | High | Admin |
| **FR-ADM-05** | The system shall allow the Admin to toggle the blocked status (`isBlocked: true/false`) of any non-admin user with instantaneous revocation effect. | Critical | Admin |
| **FR-ADM-06** | The system shall provide deep-inspection profile views for examiners, detailing their created quizzes, student participation counts, and community associations. | High | Admin |
| **FR-ADM-07** | The system shall provide deep-inspection profile views for aspirants, detailing their attempt history, average scores, and enrolled communities. | High | Admin |
| **FR-ADM-08** | The system shall allow the Admin to inspect any quiz in the system, including draft questions, private passcodes, and submission logs. | High | Admin |
| **FR-ADM-09** | The system shall allow the Admin to inspect any candidate's full attempt audit log with question-by-question response breakdown. | High | Admin |
| **FR-ADM-10** | The system shall provide full oversight of all communities (public and private), displaying owner details, member rosters, and linked quizzes. | High | Admin |
| **FR-ADM-11** | The system shall allow the Admin to view their profile details and securely update their administrative password. | High | Admin |

### 4.3 Module 3: Examiner & Quiz Authoring (FR-EXM)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-EXM-01** | The system shall permit approved examiners to create a new quiz specifying `title`, `category`, `timeLimit` (minutes), `isPrivate`, and configuration flags. | Critical | Examiner |
| **FR-EXM-02** | For private quizzes, the system shall generate or accept a unique `quizCode` required by aspirants to unlock the exam. | High | Examiner |
| **FR-EXM-03** | The system shall allow examiners to configure exam options: `shuffleQuestions`, `oneAttemptOnly`, and `showResultImmediately`. | Medium | Examiner |
| **FR-EXM-04** | The system shall allow examiners to add Multiple Choice (MCQ) questions with 2 to 6 options, marking the single `correctAnswer` and assigning `marks`. | Critical | Examiner |
| **FR-EXM-05** | The system shall allow examiners to add open-ended Theory questions. | Medium | Examiner |
| **FR-EXM-06** | The system shall allow examiners to update or delete existing questions in their authored quizzes. | High | Examiner |
| **FR-EXM-07** | The system shall allow examiners to publish a quiz (`isPublished: true`), making it available to aspirants. | Critical | Examiner |
| **FR-EXM-08** | The system shall increment the `version` counter and record `lastRepublished` when an examiner edits and republishes an active quiz. | High | Examiner |
| **FR-EXM-09** | The system shall allow examiners to associate a quiz with a specific community (`communityId`), restricting access to community members. | High | Examiner |
| **FR-EXM-10** | The system shall allow examiners to delete invalid or fraudulent student attempts from their quiz results dashboard. | Medium | Examiner |

### 4.4 Module 4: Aspirant & Examination Engine (FR-ASP)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-ASP-01** | The system shall allow aspirants to select and update their academic `interests` to customize their dashboard quiz recommendations. | Medium | Aspirant |
| **FR-ASP-02** | The system shall display a searchable, category-filterable feed of all published public quizzes. | Critical | Aspirant |
| **FR-ASP-03** | The system shall provide an access code portal enabling aspirants to unlock and attempt private quizzes using a valid `quizCode`. | High | Aspirant |
| **FR-ASP-04** | The system shall enforce the `oneAttemptOnly` constraint, preventing an aspirant from re-attempting a quiz if already submitted. | High | Aspirant |
| **FR-ASP-05** | The system shall render a full-screen, focused examination interface with a synchronized countdown timer based on `timeLimit`. | Critical | Aspirant |
| **FR-ASP-06** | The system shall automatically submit the examination when the countdown timer reaches zero, grading all answered questions. | Critical | Aspirant |
| **FR-ASP-07** | The system shall randomly shuffle question presentation order if the quiz has `shuffleQuestions: true`. | Medium | Aspirant |
| **FR-ASP-08** | The system shall immediately evaluate MCQ responses upon submission, calculating `score`, `totalMarks`, and `percentage`. | Critical | Aspirant |
| **FR-ASP-09** | The system shall store the completed submission in the `Attempt` collection, logging each question ID, selected option, and correctness flag. | Critical | Aspirant |

### 4.5 Module 5: Collaborative Communities (FR-COM)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-COM-01** | The system shall allow examiners to create a Community with `name`, `description`, `category`, `visibility` (`public`/`private`), and optional `password`. | High | Examiner |
| **FR-COM-02** | The system shall automatically generate a unique `communityCode` for each created community. | High | System |
| **FR-COM-03** | The system shall register the creator as the Community `owner` in the `CommunityMember` collection. | High | System |
| **FR-COM-04** | The system shall allow aspirants and examiners to discover public communities and join them with a single click. | High | Aspirant/Examiner |
| **FR-COM-05** | The system shall require users to supply the correct `password` when attempting to join a private community. | High | Aspirant/Examiner |
| **FR-COM-06** | The system shall display all quizzes published specifically within a joined community on the community details page. | High | Aspirant/Examiner |
| **FR-COM-07** | The system shall allow examiners to view the full member roster (`CommunityMembers`) of communities they administer. | Medium | Examiner |

### 4.6 Module 6: Results, Reports & Analytics (FR-RES)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-RES-01** | The system shall display an immediate post-submission scorecard to the aspirant if `showResultImmediately` is enabled. | High | Aspirant |
| **FR-RES-02** | The system shall provide aspirants with a "My Performance" portal displaying historical attempts, average score trends, and pass/fail indicators. | High | Aspirant |
| **FR-RES-03** | The system shall provide examiners with a multi-level results dashboard: Level 1 (Quiz Overview & Attempt Counts), Level 2 (Student Roster per Quiz), Level 3 (Student Attempt Drill-down). | High | Examiner |
| **FR-RES-04** | The system shall generate detailed question-by-question review sheets showing the student's answer, correct answer, marks awarded, and timestamp. | High | Aspirant/Examiner |

### 4.7 Module 7: AI-Powered Question Remediation (FR-AI)

| Req ID | Requirement Statement | Priority | Target Role |
| :--- | :--- | :--- | :--- |
| **FR-AI-01** | The system shall allow aspirants to request an AI explanation for any question within a completed quiz attempt. | High | Aspirant |
| **FR-AI-02** | The system shall communicate with the Python FastAPI microservice (`/explain-question`) passing question text, options, student answer, correct answer, and correctness flag. | High | Backend / AI |
| **FR-AI-03** | The system shall return a structured educational explanation containing: `questionExplanation`, `correctAnswerExplanation`, `studentAnswerExplanation`, `conceptExplanation`, `example`, and `learningTip`. | High | AI / Aspirant |
| **FR-AI-04** | The system shall persist all generated explanations in the `AIExplanation` MongoDB collection and serve future requests for the same attempt and question directly from cache. | High | Backend / DB |

---

## 5. NON-FUNCTIONAL REQUIREMENTS (NFR)

### 5.1 Performance Requirements (NFR-PERF)
* **NFR-PERF-01 (API Response Latency):** Standard database read/write REST operations shall complete with a 95th percentile latency of less than 300 milliseconds under nominal concurrency (up to 100 active users).
* **NFR-PERF-02 (AI Explanation Response):** Uncached AI explanations from the microservice shall return within 3.0 seconds; cached explanations from MongoDB shall return within 50 milliseconds.
* **NFR-PERF-03 (Frontend Bundle Efficiency):** The production React frontend built via Vite shall maintain a total bundle size of under 1.5 MB uncompressed, achieving an initial First Contentful Paint (FCP) under 1.2 seconds on standard broadband.
* **NFR-PERF-04 (Database Query Optimization):** All queries filtering by `email`, `quizId`, `aspirantId`, `communityId`, or compound AI explanation keys shall utilize B-tree indexes to prevent collection scans.

### 5.2 Security Requirements (NFR-SEC)
* **NFR-SEC-01 (Password Encryption):** Passwords must never be stored in plain text. All credentials must be hashed with `bcryptjs` using 10 salt rounds before persistence.
* **NFR-SEC-02 (Stateless Cryptographic Tokens):** Authentication tokens must be standard JSON Web Tokens signed with a secure server-side secret (`JWT_SECRET`) with a default lifespan of 24 hours.
* **NFR-SEC-03 (Live DB Status Verification):** The `verifyToken` middleware must verify the active database record on every protected request to immediately deny blocked users or unapproved examiners.
* **NFR-SEC-04 (Role-Based Route Guards):** Backend routes must be guarded by strict role middleware (`requireRole("admin")`, `requireRole("examiner")`, `requireRole("aspirant")`). Frontend client routes must implement corresponding `ProtectedRoute` wrappers.
* **NFR-SEC-05 (Zero Credential Autofill Vulnerability):** All login forms must render with empty input fields (`value=""`), `autoComplete="off"` or `"new-password"`, and never contain hardcoded demo credentials in the DOM.

### 5.3 Reliability and Availability Requirements (NFR-REL)
* **NFR-REL-01 (Fault-Tolerant AI Remediation):** If the external LLM provider encounters rate limits or connection timeouts, the FastAPI service must automatically switch to its deterministic educational rule engine without failing the HTTP request.
* **NFR-REL-02 (Graceful Error Responses):** The backend API must catch uncaught exceptions in controller handlers and return standardized JSON error objects `{ message: "...", error: "..." }` with appropriate HTTP 4xx/5xx status codes.
* **NFR-REL-03 (Database Resilience):** Mongoose connection logic must implement automatic retry attempts upon temporary database disconnection.

### 5.4 Usability and Accessibility Requirements (NFR-USA)
* **NFR-USA-01 (Responsive Design):** The user interface must adapt dynamically across standard desktop (1920x1080, 1366x768), tablet (768x1024), and mobile (375x812) viewports.
* **NFR-USA-02 (Contrast & Readability):** Text contrast ratios against dark backgrounds must satisfy WCAG 2.1 Level AA standards (minimum 4.5:1 for standard text).
* **NFR-USA-03 (Visual Feedback):** All asynchronous user actions (logging in, submitting exams, generating AI explanations) must display visual loading indicators or spinners.

### 5.5 Maintainability and Portability Requirements (NFR-MNT)
* **NFR-MNT-01 (Separation of Concerns):** The backend architecture must strictly isolate routing (`/routes`), business logic (`/controllers`), database modeling (`/models`), and security filters (`/middleware`).
* **NFR-MNT-02 (Cross-Platform Execution):** The application must execute identically on Windows, Linux, and macOS platforms with no modifications to source code.
* **NFR-MNT-03 (Configuration Externalization):** All ports, database URIs, secret keys, and administrative credentials must be externalized into `.env` files.

---

## 6. DATABASE REQUIREMENTS

The system requires a document-oriented MongoDB database configured with the following schema collections:
1. `users`: Stores account profiles, hashed passwords, roles (`admin`, `examiner`, `aspirant`), approval statuses (`pending`, `approved`, `rejected`), blocking flags, and student interests.
2. `quizzes`: Stores quiz metadata, examiner foreign keys, category, timing parameters, access codes, publishing status, and version counters.
3. `questions`: Stores individual MCQ/Theory questions linked to a `quizId`, containing question text, option arrays, correct answers, and point weights.
4. `attempts`: Records completed candidate exam submissions, linking `quizId` and `aspirantId`, storing an array of selected responses, computed score, total marks, percentage, and quiz version.
5. `communities`: Manages educator/student collaborative groups, storing name, description, category, public/private visibility, password, and owner references.
6. `communitymembers`: Association collection linking users to communities with specific permissions (`owner`, `contributor`, `member`, `student`).
7. `aiexplanations`: Caches structured AI question breakdowns with a unique compound index `{ attemptId: 1, questionId: 1, studentId: 1 }`.

---

## 7. ACCEPTANCE CRITERIA

The software shall be deemed acceptable when all the following criteria are validated:

1. **Authentication & RBAC:**
   * Aspirant can register and immediately log in.
   * Examiner registers in `pending` state; login is rejected with HTTP 403 until approved by Admin.
   * Admin logs in via seeded credentials and sees full system statistics.
   * Blocking a user in the Admin panel immediately invalidates their token requests.
2. **Quiz Authoring & Taking:**
   * Examiner creates a quiz, adds MCQs with options, and publishes the quiz.
   * Aspirant discovers the quiz, takes it within the active countdown timer, and submits.
   * Quiz automatically submits when timer expires.
   * Instant score is calculated accurately based on marks assigned to correct options.
3. **Collaborative Communities:**
   * Examiner creates a private community with a passcode.
   * Aspirant searches, enters passcode, joins community, and accesses community-specific quizzes.
4. **AI Explanations:**
   * Aspirant clicks "AI Explanation" on a completed attempt question.
   * System returns a 6-part educational breakdown in under 3.5 seconds.
   * Subsequent clicks for the same question return the cached explanation in under 50 milliseconds.
5. **UI & Code Cleanliness:**
   * No login page displays prefilled or hardcoded passwords on load.
   * All API routes adhere to REST conventions and return structured JSON.
