# INSTALLATION AND SETUP GUIDE

## ONLINE QUIZ APPLICATION (MERN STACK + FASTAPI AI SERVICE)

**Document Version:** 1.0.0  
**Target OS:** Microsoft Windows 10 / 11 (Supports macOS / Linux)  
**Target Editor:** Visual Studio Code (VS Code)  

---

## TABLE OF CONTENTS

1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Required Software & Version Verification](#2-required-software--version-verification)
3. [Project Directory Structure Overview](#3-project-directory-structure-overview)
4. [Step-by-Step Installation Guide](#4-step-by-step-installation-guide)
   * 4.1 [Step 1: Open Project in VS Code](#41-step-1-open-project-in-vs-code)
   * 4.2 [Step 2: Install Backend Dependencies](#42-step-2-install-backend-dependencies)
   * 4.3 [Step 3: Install Frontend Dependencies](#43-step-3-install-frontend-dependencies)
   * 4.4 [Step 4: Install AI Service Dependencies (Python)](#44-step-4-install-ai-service-dependencies-python)
5. [Database Setup (MongoDB Local or Atlas)](#5-database-setup-mongodb-local-or-atlas)
6. [Environment Configuration (.env Templates)](#6-environment-configuration-env-templates)
   * 6.1 [Backend Environment Configuration (`backend/.env`)](#61-backend-environment-configuration-backendenv)
   * 6.2 [Frontend Environment Configuration (`frontend/.env`)](#62-frontend-environment-configuration-frontendenv)
   * 6.3 [AI Service Environment Configuration (`ai-service/.env`)](#63-ai-service-environment-configuration-ai-serviceenv)
7. [Starting the Application Services](#7-starting-the-application-services)
   * 7.1 [Terminal 1: Start Node.js / Express Backend](#71-terminal-1-start-nodejs--express-backend)
   * 7.2 [Terminal 2: Start React / Vite Frontend](#72-terminal-2-start-react--vite-frontend)
   * 7.3 [Terminal 3: Start Python FastAPI AI Microservice](#73-terminal-3-start-python-fastapi-ai-microservice)
8. [Verifying System Operation](#8-verifying-system-operation)
9. [Initial Admin Account Setup](#9-initial-admin-account-setup)
10. [Troubleshooting & Common Issues](#10-troubleshooting--common-issues)

---

## 1. PREREQUISITES & SYSTEM REQUIREMENTS

Before setting up the project on Windows, verify that your computer meets the following specifications:
* **Operating System:** Windows 10 or Windows 11 (64-bit).
* **Processor:** Intel Core i3 / AMD Ryzen 3 or higher.
* **RAM:** Minimum 8 GB (16 GB recommended).
* **Disk Space:** At least 5 GB free disk space.
* **Network:** Active internet connection for downloading npm packages and python modules.

---

## 2. REQUIRED SOFTWARE & VERSION VERIFICATION

Install the following software packages if not already present on your machine:

1. **Node.js (LTS Version):**
   * Recommended Version: `v18.x` or `v20.x` LTS.
   * Download: [https://nodejs.org/](https://nodejs.org/)
   * Verify in PowerShell:
     ```powershell
     node -v
     npm -v
     ```
2. **Python (for AI Microservice):**
   * Recommended Version: `Python 3.10.x` or `Python 3.11.x`.
   * Download: [https://www.python.org/downloads/](https://www.python.org/downloads/)
   * *Important:* Ensure the checkbox **"Add Python to PATH"** is selected during installation.
   * Verify in PowerShell:
     ```powershell
     python --version
     pip --version
     ```
3. **MongoDB:**
   * Choice A (Local): **MongoDB Community Server (v6.x or v7.x)** + **MongoDB Compass** GUI.
   * Choice B (Cloud): **MongoDB Atlas** free cluster account.
   * Download Community Server: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
4. **Visual Studio Code (VS Code):**
   * Download: [https://code.visualstudio.com/](https://code.visualstudio.com/)
   * Recommended Extensions:
     * *ESLint* (dbaeumer.vscode-eslint)
     * *Python* (ms-python.python)
     * *Thunder Client* or *Postman* (for API testing)

---

## 3. PROJECT DIRECTORY STRUCTURE OVERVIEW

The application consists of three primary modules:

```
Online Quiz Application/
├── backend/                  # Node.js + Express.js REST API
│   ├── config/               # DB connection & Admin Seeder
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # verifyToken & RBAC middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route definitions
│   ├── package.json          # Backend dependencies & scripts
│   └── server.js             # Express entry point
├── frontend/                 # React 19 + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # Reusable UI widgets
│   │   ├── context/          # AuthContext session provider
│   │   ├── pages/            # Admin, Examiner, Aspirant views
│   │   ├── routes/           # AppRoutes.jsx client routing
│   │   └── styles/           # Vanilla CSS stylesheets
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite bundler configuration
├── ai-service/               # Python FastAPI Microservice
│   ├── models/               # Pydantic schema models
│   ├── services/             # LLM & fallback explanation services
│   ├── app.py                # FastAPI entry point
│   └── requirements.txt      # Python dependencies
└── docs/                     # Full project documentation suite
```

---

## 4. STEP-BY-STEP INSTALLATION GUIDE

### 4.1 Step 1: Open Project in VS Code
1. Launch **Visual Studio Code**.
2. Click **File > Open Folder...** and select the root directory: `Online Quiz Application`.
3. Open the integrated terminal (`Ctrl + ~` or **Terminal > New Terminal**).

---

### 4.2 Step 2: Install Backend Dependencies
In the VS Code terminal, navigate to the `backend` directory and run `npm install`:

```powershell
cd backend
npm install
cd ..
```

*Verified dependencies installed:*
* `express` (v5.2.x)
* `mongoose` (v9.7.x)
* `jsonwebtoken` (v9.0.x)
* `bcryptjs` (v3.0.x)
* `cors` (v2.8.x)
* `dotenv` (v17.4.x)
* `morgan` (v1.11.x)
* `nodemon` (v3.1.x dev dependency)

---

### 4.3 Step 3: Install Frontend Dependencies
Navigate to the `frontend` directory and run `npm install`:

```powershell
cd frontend
npm install
cd ..
```

*Verified dependencies installed:*
* `react` (v19.2.x)
* `react-dom` (v19.2.x)
* `react-router-dom` (v7.18.x)
* `vite` (v8.2.x)
* `@vitejs/plugin-react` (v6.1.x)

---

### 4.4 Step 4: Install AI Service Dependencies (Python)
Navigate to the `ai-service` directory, create a Python virtual environment, and install dependencies:

```powershell
cd ai-service

# Create virtual environment named 'venv'
python -m venv venv

# Activate virtual environment on Windows PowerShell:
.\venv\Scripts\Activate.ps1

# (If PowerShell blocks script execution, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# Install required Python packages:
pip install -r requirements.txt

cd ..
```

*Verified Python packages installed:*
* `fastapi>=0.100.0`
* `uvicorn>=0.22.0`
* `pydantic>=2.0.0`
* `python-dotenv>=1.0.0`
* `httpx>=0.24.0`
* `openai>=1.0.0`
* `google-generativeai>=0.3.0`

---

## 5. DATABASE SETUP (MONGODB LOCAL OR ATLAS)

### Option A: Local MongoDB (Recommended for Offline Development)
1. Ensure the **MongoDB Windows Service** is running:
   * Open Windows Task Manager > Services tab > look for `MongoDB` (Status should be `Running`).
   * Alternatively, start via PowerShell as Admin: `net start MongoDB`.
2. The default local connection URI is:
   ```
   mongodb://127.0.0.1:27017/quiz_db
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Add your current IP address to the Network Access whitelist (`0.0.0.0/0` for development).
3. Create a Database User with username and password.
4. Copy your cluster connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/quiz_db?retryWrites=true&w=majority`).

---

## 6. ENVIRONMENT CONFIGURATION (.ENV TEMPLATES)

Create the corresponding `.env` files in each subfolder using the following templates:

### 6.1 Backend Environment Configuration (`backend/.env`)
Create a file named `.env` inside the `backend/` folder:

```env
# Server Port
PORT=5000

# MongoDB Connection String (Local or Atlas)
MONGO_URI=mongodb://127.0.0.1:27017/quiz_db

# JWT Secret Key (Use a strong, random 32+ character string)
JWT_SECRET=YOUR_SECURE_JWT_SECRET_KEY_HERE_MIN_32_CHARS

# Master Administrator Credentials (Seeded automatically on startup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminSecurePassword@123

# Python AI Microservice URL
AI_SERVICE_URL=http://localhost:8000
```

> [!IMPORTANT]
> Replace `YOUR_SECURE_JWT_SECRET_KEY_HERE_MIN_32_CHARS` and `AdminSecurePassword@123` with your own private secrets.

---

### 6.2 Frontend Environment Configuration (`frontend/.env`)
Create a file named `.env` inside the `frontend/` folder:

```env
# URL of the backend REST API
VITE_API_URL=http://localhost:5000
```

---

### 6.3 AI Service Environment Configuration (`ai-service/.env`)
Create a file named `.env` inside the `ai-service/` folder:

```env
# AI Service Port & Host
PORT=8000
HOST=0.0.0.0

# AI Provider ("openai", "groq", "gemini", or "auto")
PROVIDER=auto

# Optional LLM API Keys (Leave blank to use built-in educational fallback generator)
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 7. STARTING THE APPLICATION SERVICES

To run the complete system, open **three separate terminals** in VS Code:

### 7.1 Terminal 1: Start Node.js / Express Backend
```powershell
cd backend
npm run dev
```
*Expected Output:*
```
[AdminSeeder] Admin account initialized for admin@example.com
Server Running On 5000
MongoDB Connected: 127.0.0.1
```

---

### 7.2 Terminal 2: Start React / Vite Frontend
```powershell
cd frontend
npm run dev
```
*Expected Output:*
```
  VITE v8.2.2  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 7.3 Terminal 3: Start Python FastAPI AI Microservice
```powershell
cd ai-service
.\venv\Scripts\Activate.ps1
python app.py
```
*Expected Output:*
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 8. VERIFYING SYSTEM OPERATION

Open your web browser and navigate to the following endpoints to verify all services:

1. **Frontend Web UI:** `http://localhost:5173`
   * Should display the application landing page with clean login and registration options.
2. **Backend API Health:** `http://localhost:5000/`
   * Should return text: `Online Quiz Backend Running`.
3. **AI Service Health:** `http://localhost:8000/health`
   * Should return JSON: `{"status":"healthy","service":"Online Quiz AI Explanation Service","version":"1.0.0"}`.

---

## 9. INITIAL ADMIN ACCOUNT SETUP

The backend features an automatic administrator seeder (`backend/config/adminSeeder.js`):
1. When the backend starts up for the first time, it reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.
2. It automatically creates the Admin user with `role: "admin"` and `approvalStatus: "approved"`.
3. You can immediately log into the Admin portal:
   * **URL:** `http://localhost:5173/admin/login`
   * **Email:** Value set in `ADMIN_EMAIL` (e.g. `admin@example.com`)
   * **Password:** Value set in `ADMIN_PASSWORD`

---

## 10. TROUBLESHOOTING & COMMON ISSUES

### Issue 1: `Port 5000 / 5173 / 8000 is already in use (EADDRINUSE)`
* **Cause:** A previous instance of the server is still running in the background.
* **Resolution (PowerShell):**
  ```powershell
  # Find and terminate process on port 5000:
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```

### Issue 2: `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`
* **Cause:** MongoDB service is not running locally.
* **Resolution:** Open PowerShell as Administrator and run:
  ```powershell
  net start MongoDB
  ```

### Issue 3: `Python virtualenv script execution is disabled on this system`
* **Cause:** Windows PowerShell Execution Policy restricts running `.ps1` scripts by default.
* **Resolution:** Run the following command in PowerShell:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\venv\Scripts\Activate.ps1
  ```

### Issue 4: `CORS policy error in browser console`
* **Cause:** Frontend is running on a port not whitelisted in `backend/server.js`.
* **Resolution:** Ensure frontend is running on `http://localhost:5173` or `http://localhost:5174` (both are whitelisted in `backend/server.js`).

### Issue 5: `AI explanation returns fallback explanation`
* **Cause:** No external LLM API key configured in `ai-service/.env`.
* **Resolution:** This is intentional behavior. The microservice will automatically deliver high-quality rule-based educational explanations without crashing. If you want live LLM generation, set `OPENAI_API_KEY` or `GROQ_API_KEY` in `ai-service/.env`.
