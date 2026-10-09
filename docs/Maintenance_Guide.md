# SYSTEM MAINTENANCE, OPERATIONS, AND EXTENSION GUIDE

## ONLINE QUIZ APPLICATION (MERN STACK + FASTAPI AI SERVICE)

**Document Version:** 1.0.0  
**Target Audience:** System Administrators, DevOps Engineers, and Future Software Developers  

---

## TABLE OF CONTENTS

1. [Project Directory & File Structure](#1-project-directory--file-structure)
2. [Key Source Files & Architectural Responsibilities](#2-key-source-files--architectural-responsibilities)
3. [Environment Configuration Management](#3-environment-configuration-management)
4. [Runtime Operations & Service Management](#4-runtime-operations--service-management)
5. [Diagnostics & Error Troubleshooting](#5-diagnostics--error-troubleshooting)
   * 5.1 [Backend Diagnostics & Morgan Logs](#51-backend-diagnostics--morgan-logs)
   * 5.2 [Frontend Diagnostics & Console Errors](#52-frontend-diagnostics--console-errors)
   * 5.3 [AI Microservice Diagnostics](#53-ai-microservice-diagnostics)
   * 5.4 [MongoDB Connection & Replica Health](#54-mongodb-connection--replica-health)
6. [API Debugging & Request Tracing](#6-api-debugging--request-tracing)
7. [Database Backup, Restoration & Maintenance](#7-database-backup-restoration--maintenance)
   * 7.1 [Automated Database Backup (`mongodump`)](#71-automated-database-backup-mongodump)
   * 7.2 [Database Restoration Procedure (`mongorestore`)](#72-database-restoration-procedure-mongorestore)
   * 7.3 [Index Compaction & Verification](#73-index-compaction--verification)
8. [Security Maintenance & Hardening](#8-security-maintenance--hardening)
   * 8.1 [JWT Secret Rotation Procedure](#81-jwt-secret-rotation-procedure)
   * 8.2 [Bcrypt Salt Management](#82-bcrypt-salt-management)
   * 8.3 [CORS Whitelist Management](#83-cors-whitelist-management)
9. [Developer Extension Guide: Adding a New Feature Module](#9-developer-extension-guide-adding-a-new-feature-module)
   * 9.1 [Step 1: Create the Mongoose Model](#91-step-1-create-the-mongoose-model)
   * 9.2 [Step 2: Implement Controller Business Logic](#92-step-2-implement-controller-business-logic)
   * 9.3 [Step 3: Define Express Routes & RBAC Guards](#93-step-3-define-express-routes--rbac-guards)
   * 9.4 [Step 4: Mount Route in `server.js`](#94-step-4-mount-route-in-serverjs)
   * 9.5 [Step 5: Create React Views & Register in `AppRoutes.jsx`](#95-step-5-create-react-views--register-in-approutesjsx)

---

## 1. PROJECT DIRECTORY & FILE STRUCTURE

```
Online Quiz Application/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection logic
│   │   └── adminSeeder.js            # Initial admin seeding & user migration
│   ├── controllers/
│   │   ├── adminController.js        # Admin stats, approvals, user blocking
│   │   ├── aiController.js           # Proxy & cache for AI explanation service
│   │   ├── authController.js         # User registration & authentication
│   │   ├── communityController.js   # Community CRUD, discovery, membership
│   │   ├── manageQuestionController.js # Question edits & versioned republishing
│   │   ├── performanceController.js # Aspirant score history & details
│   │   ├── profileController.js     # User profile, password, interests
│   │   ├── quizController.js        # Quiz creation, taking, scoring, submit
│   │   ├── resultController.js      # Examiner multi-level submission analytics
│   │   └── studentController.js     # Aspirant community-scoped quizzes
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification, live DB block & approval checks
│   ├── models/
│   │   ├── AIExplanation.js         # Cached AI educational explanations
│   │   ├── Attempt.js               # Candidate exam attempt & answer logs
│   │   ├── Community.js             # Collaborative group metadata
│   │   ├── CommunityMember.js       # Community membership association
│   │   ├── Question.js              # MCQ & Theory question items
│   │   ├── Quiz.js                  # Assessment metadata & versioning
│   │   └── User.js                  # Accounts, roles, approval & block status
│   ├── routes/                      # Resource-specific Express router files
│   ├── package.json                 # Node.js backend dependencies & scripts
│   └── server.js                    # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/              # Shared UI components
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global authentication & user state provider
│   │   ├── pages/
│   │   │   ├── admin/               # 14 Admin management views
│   │   │   ├── aspirant/            # 14 Aspirant exam & community views
│   │   │   ├── auth/                # Login & registration views
│   │   │   ├── examiner/            # 17 Examiner authoring & result views
│   │   │   └── Profile.jsx          # Shared profile & password settings
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx        # React Router 7 configuration with guards
│   │   ├── styles/                  # Custom Vanilla CSS stylesheets
│   │   ├── App.jsx                  # Root React component
│   │   └── main.jsx                 # Vite application mount
│   ├── package.json                 # Frontend dependencies & scripts
│   └── vite.config.js               # Vite bundler configuration
├── ai-service/
│   ├── models/
│   │   └── request_models.py        # Pydantic schemas for explanation requests
│   ├── services/
│   │   ├── explanation_service.py   # Multi-provider LLM & fallback logic
│   │   └── providers/               # Provider-specific connectors
│   ├── app.py                       # FastAPI application entry point
│   └── requirements.txt             # Python dependencies
└── docs/                            # Complete technical documentation suite
```

---

## 2. KEY SOURCE FILES & ARCHITECTURAL RESPONSIBILITIES

| File Path | Core Architectural Responsibility |
| :--- | :--- |
| `backend/server.js` | Express app initialization, CORS middleware, route mounting, port listening, and database connection trigger. |
| `backend/config/adminSeeder.js` | Idempotent migration that synchronizes Admin account and ensures all existing examiners have valid approval statuses. |
| `backend/middleware/authMiddleware.js` | Central security gatekeeper. Validates JWT, queries MongoDB for live `isBlocked` / `approvalStatus`, and attaches sanitized `req.user`. |
| `backend/controllers/quizController.js` | Handles quiz creation, passcode verification, countdown attempt capture, automated MCQ grading, and score recording. |
| `backend/controllers/aiController.js` | Implements the caching proxy pattern: checks MongoDB `AIExplanation` cache first; forwards to FastAPI on cache miss. |
| `frontend/src/routes/AppRoutes.jsx` | Defines all client routes, implementing `ProtectedRoute` guards for role authorization. |
| `frontend/src/context/AuthContext.jsx` | Supplies user state, token persistence in `localStorage`, and real-time login/logout methods across the React component tree. |
| `ai-service/app.py` | FastAPI application exposing `/health` and `/explain-question` endpoints with CORS and exception handling. |
| `ai-service/services/explanation_service.py` | Generates 6-part educational breakdowns via OpenAI/Groq or the built-in educational heuristic fallback engine. |

---

## 3. ENVIRONMENT CONFIGURATION MANAGEMENT

All sensitive parameters, database connection strings, and ports are isolated in `.env` files. Ensure these files are **never committed to public version control repositories** (they are included in `.gitignore`).

### Environment Variables Reference Table:

| Variable | Target File | Description | Recommended Setting (Dev) |
| :--- | :--- | :--- | :--- |
| `PORT` | `backend/.env` | Express API port | `5000` |
| `MONGO_URI` | `backend/.env` | MongoDB connection URI | `mongodb://127.0.0.1:27017/quiz_db` |
| `JWT_SECRET` | `backend/.env` | Secret key for signing JWT tokens | Random 32+ character hex string |
| `ADMIN_EMAIL` | `backend/.env` | Master Admin login email | Institutional admin email |
| `ADMIN_PASSWORD` | `backend/.env` | Master Admin initial password | Strong alphanumeric string |
| `AI_SERVICE_URL` | `backend/.env` | URL of Python AI microservice | `http://localhost:8000` |
| `VITE_API_URL` | `frontend/.env` | Backend API URL for React | `http://localhost:5000` |
| `PORT` | `ai-service/.env`| FastAPI service port | `8000` |
| `PROVIDER` | `ai-service/.env`| LLM provider choice | `"auto"`, `"openai"`, or `"groq"` |
| `OPENAI_API_KEY` | `ai-service/.env`| OpenAI API key (Optional) | `sk-...` |

---

## 4. RUNTIME OPERATIONS & SERVICE MANAGEMENT

To maintain continuous execution in development and production:

### Development Execution:
* **Backend:** `cd backend && npm run dev` (monitored by `nodemon`).
* **Frontend:** `cd frontend && npm run dev` (monitored by `vite`).
* **AI Service:** `cd ai-service && .\venv\Scripts\Activate.ps1 && python app.py`.

### Production Deployment Recommendation (PM2 Process Manager):
```bash
# Start backend process with PM2
pm2 start backend/server.js --name "quiz-backend"

# Start Python AI service with PM2
pm2 start "uvicorn app:app --host 0.0.0.0 --port 8000" --cwd "./ai-service" --name "quiz-ai-service"

# Build optimized frontend bundle
cd frontend && npm run build
# Serve dist folder via NGINX or static web server
```

---

## 5. DIAGNOSTICS & ERROR TROUBLESHOOTING

### 5.1 Backend Diagnostics & Morgan Logs
* The Express server uses `morgan("dev")` for concise HTTP request logging in the terminal:
  * `POST /api/auth/login/aspirant 200 45.123 ms` (Successful login)
  * `GET /api/admin/stats 403 12.450 ms` (Forbidden access attempt)
* When an unhandled error occurs, inspect the terminal traceback to identify the exact controller and line number.

### 5.2 Frontend Diagnostics & Console Errors
* Open Chrome Developer Tools (`F12` or `Ctrl + Shift + I`) > **Console** tab.
* Look for:
  * Network fetch errors (`ERR_CONNECTION_REFUSED` indicates backend is not running on port 5000).
  * CORS errors (`Cross-Origin Request Blocked` indicates frontend port mismatch with CORS config).

### 5.3 AI Microservice Diagnostics
* Query the health endpoint:
  ```powershell
  curl http://localhost:8000/health
  ```
* If the AI service fails to generate an explanation, check `ai-service` terminal logs. The service will automatically degrade to the rule-based fallback without returning HTTP 500.

### 5.4 MongoDB Connection & Replica Health
* Test MongoDB connectivity via MongoDB Compass or mongosh:
  ```powershell
  mongosh "mongodb://127.0.0.1:27017/quiz_db"
  ```
* Check active collection counts:
  ```javascript
  show collections;
  db.users.countDocuments();
  db.quizzes.countDocuments();
  ```

---

## 6. API DEBUGGING & REQUEST TRACING

When debugging API behavior, use the following sample `curl` command with a valid JWT token:

```powershell
# Test authenticated endpoint
curl -X GET http://localhost:5000/api/admin/stats `
  -H "Authorization: Bearer YOUR_ACTUAL_JWT_TOKEN" `
  -H "Content-Type: application/json"
```

---

## 7. DATABASE BACKUP, RESTORATION & MAINTENANCE

### 7.1 Automated Database Backup (`mongodump`)
To create a complete binary snapshot of the database:

```powershell
# Create timestamped backup directory
$backupDir = "backups/" + (Get-Date -Format "yyyy-MM-dd_HH-mm")
mkdir -p $backupDir

# Dump the quiz_db database
mongodump --db=quiz_db --out=$backupDir
```

### 7.2 Database Restoration Procedure (`mongorestore`)
To restore from a previous backup snapshot:

```powershell
# Restore quiz_db from backup folder
mongorestore --db=quiz_db --drop backups/2026-09-27_10-00/quiz_db/
```
*(The `--drop` flag clears existing collections before restoring).*

### 7.3 Index Compaction & Verification
To verify and rebuild indexes for maximum query throughput:

```javascript
// Run in mongosh
use quiz_db;
db.users.reIndex();
db.aiexplanations.reIndex();
```

---

## 8. SECURITY MAINTENANCE & HARDENING

### 8.1 JWT Secret Rotation Procedure
If the `JWT_SECRET` is compromised:
1. Generate a new cryptographic 64-character secret string.
2. Update `JWT_SECRET` in `backend/.env`.
3. Restart the backend server (`npm run dev` or `pm2 restart quiz-backend`).
4. *Effect:* All existing issued tokens will be invalidated immediately, requiring all active users to log in again.

### 8.2 Bcrypt Salt Management
The application enforces a salt factor of 10 (`bcrypt.hash(password, 10)`). This provides an optimal balance between cryptographic resilience against brute-force attacks and CPU latency (< 80ms per hash on modern processors).

### 8.3 CORS Whitelist Management
To add a new authorized frontend domain (e.g. for staging or production deployment), update the `corsOptions` object in `backend/server.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5174', 
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://quiz.yourdomain.edu' // Add production domain here
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
};
```

---

## 9. DEVELOPER EXTENSION GUIDE: ADDING A NEW FEATURE MODULE

To add a new feature (e.g., an **"Announcement"** module) cleanly without breaking existing logic:

### 9.1 Step 1: Create the Mongoose Model
Create `backend/models/Announcement.js`:
```javascript
const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },
    isPinned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
```

---

### 9.2 Step 2: Implement Controller Business Logic
Create `backend/controllers/announcementController.js`:
```javascript
const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, communityId, isPinned } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      communityId: communityId || null,
      isPinned: isPinned || false,
      authorId: req.user.id,
      authorName: req.user.name
    });
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement };
```

---

### 9.3 Step 3: Define Express Routes & RBAC Guards
Create `backend/routes/announcementRoutes.js`:
```javascript
const express = require("express");
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require("../controllers/announcementController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Any authenticated user can read announcements
router.get("/", verifyToken, getAnnouncements);

// Only examiners and admins can create announcements
router.post("/create", verifyToken, requireRole(["examiner", "admin"]), createAnnouncement);

module.exports = router;
```

---

### 9.4 Step 4: Mount Route in `server.js`
In `backend/server.js`, import and mount the new route:
```javascript
app.use("/api/announcements", require("./routes/announcementRoutes"));
```

---

### 9.5 Step 5: Create React Views & Register in `AppRoutes.jsx`
1. Create `frontend/src/pages/Announcements.jsx`.
2. Register the route inside `frontend/src/routes/AppRoutes.jsx` wrapped inside the appropriate `ProtectedRoute`.
3. Add a navigation link to the relevant dashboard navbar.
