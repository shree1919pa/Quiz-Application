# ONLINE QUIZ APPLICATION — COMPLETE PROJECT DOCUMENTATION SUITE

Welcome to the central documentation index for the **Online Quiz Application**, an enterprise-grade digital assessment and learning platform engineered using the **MERN Stack (MongoDB, Express.js 5, React 19, Node.js)** and an auxiliary **Python FastAPI AI microservice**.

---

## 📚 DOCUMENTATION DIRECTORY

Click any of the links below to access the comprehensive documentation files:

| # | Document | File Link | Target Audience / Purpose |
| :-: | :--- | :--- | :--- |
| **1** | **Project Report** | [Project_Report.md](./Project_Report.md) | Academic college engineering project report with abstract, background, objectives, and evaluation. |
| **2** | **Software Requirements Specification (SRS)** | [SRS.md](./SRS.md) | IEEE 830-style specification with functional (`FR-xx`) and non-functional (`NFR-xx`) requirements. |
| **3** | **System Architecture & Design** | [System_Architecture.md](./System_Architecture.md) | Multi-tier architecture, component flows, and Mermaid sequence/flowchart diagrams. |
| **4** | **Database Design & Schema Reference** | [Database_Design.md](./Database_Design.md) | Complete Mongoose models, data dictionaries, compound indexes, and Mermaid ER diagram. |
| **5** | **REST API Documentation** | [API_Documentation.md](./API_Documentation.md) | Endpoint specifications, HTTP methods, authorization scopes, request payloads, and responses. |
| **6** | **Installation & Setup Guide** | [Installation_Guide.md](./Installation_Guide.md) | Step-by-step setup for Windows & VS Code: Node.js, Python venv, MongoDB, and `.env` templates. |
| **7** | **User Manual** | [User_Manual.md](./User_Manual.md) | Step-by-step operational workflows for Administrators, Examiners, and Aspirants. |
| **8** | **Testing & Quality Assurance** | [Testing_Documentation.md](./Testing_Documentation.md) | Testing strategy and structured test cases table with preconditions and expected results. |
| **9** | **Maintenance & Extension Guide** | [Maintenance_Guide.md](./Maintenance_Guide.md) | Troubleshooting, MongoDB backups (`mongodump`), security maintenance, and adding new modules. |

---

## 🚀 PROJECT OVERVIEW

The **Online Quiz Application** provides an end-to-end ecosystem for online assessments, academic collaboration, and automated educational remediation.

### Core Capabilities:
1. **Three-Tier Role-Based Access Control (RBAC):**
   * **Administrator:** Centralized dashboard, examiner vetting queue (`pending` -> `approved`/`rejected`), instant account blocking, quiz/attempt auditing, and community oversight.
   * **Examiner (Educator):** Quiz authoring, Multiple Choice & Theory question management, private passcodes, versioned republishing, candidate submission analytics, and collaborative communities.
   * **Aspirant (Student):** Interest-based quiz discovery, timed examination engine with automated timer submission, instant scorecards, longitudinal performance tracking, and on-demand AI explanations.
2. **Real-Time Security Enforcement:**
   * JWT tokens verified with live database lookups on every request, immediately revoking access for blocked users or unapproved examiners.
3. **Collaborative Academic Communities:**
   * Public and password-gated educator/student communities with scoped mock tests.
4. **AI-Powered Conceptual Remediation:**
   * Python FastAPI microservice providing structured 6-part question breakdowns, cached in MongoDB via compound unique indexes.

---

## 🛠️ TECHNOLOGY STACK

```
+=============================================================================+
| Layer               | Technology               | Version / Role             |
+=====================+==========================+============================+
| Frontend Framework  | React                    | v19.2.x (Single Page App)  |
| Frontend Tooling    | Vite                     | v8.2.x (Dev Server / Build)|
| Client Routing      | React Router DOM         | v7.18.x (Route Guards)     |
| Frontend Styling    | Vanilla CSS              | Modern Glassmorphic System |
| Backend Platform    | Node.js                  | v18.x / v20.x LTS          |
| Web Framework       | Express.js               | v5.2.x (REST API)          |
| Database Engine     | MongoDB                  | v6.x / v7.x (Document DB)  |
| Database ODM        | Mongoose                 | v9.7.x (Schema Validation) |
| Authentication      | JSON Web Tokens + Bcrypt | RFC 7519 + Bcryptjs v3     |
| AI Microservice     | Python + FastAPI         | Python 3.10+ / FastAPI 0.10|
| ASGI Server         | Uvicorn                  | v0.22.x                    |
+=============================================================================+
```

---

## 📁 PROJECT FOLDER STRUCTURE

```
Online Quiz Application/
├── backend/                  # Node.js Express REST API Server
│   ├── config/               # Database connection & Admin seeder
│   ├── controllers/          # Business logic handlers (Auth, Admin, Quiz, Community, AI)
│   ├── middleware/           # verifyToken & requireRole auth guards
│   ├── models/               # Mongoose schemas (User, Quiz, Question, Attempt, Community, AIExplanation)
│   ├── routes/               # Express router endpoints
│   ├── package.json          # Backend dependencies
│   └── server.js             # Backend entry point
├── frontend/                 # React 19 Single Page Application
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # AuthContext session provider
│   │   ├── pages/            # Role pages (Admin, Examiner, Aspirant, Auth)
│   │   ├── routes/           # AppRoutes.jsx client routing
│   │   └── styles/           # Custom Vanilla CSS stylesheets
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite build configuration
├── ai-service/               # Python FastAPI AI Explanation Microservice
│   ├── models/               # Pydantic data schemas
│   ├── services/             # LLM connectors & fallback rule engine
│   ├── app.py                # FastAPI entry point
│   └── requirements.txt      # Python dependencies
└── docs/                     # Full project documentation suite
```

---

## ⚡ QUICK START SUMMARY

For complete setup instructions, refer to the [Installation Guide](./Installation_Guide.md).

### 1. Backend Setup:
```powershell
cd backend
npm install
# Configure backend/.env with MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

### 2. Frontend Setup:
```powershell
cd frontend
npm install
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

### 3. AI Service Setup:
```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
*(AI Microservice runs on `http://localhost:8000`)*

---

*Documentation compiled and maintained for the Online Quiz Application project.*
