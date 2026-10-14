const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

// Load environment variables before any other operations
dotenv.config();

const connectDB = require("./config/db");
const manageQuestionRoutes = require("./routes/manageQuestionRoutes");
const profileRoutes = require("./routes/profileRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const communityRoutes = require("./routes/communityRoutes");
const studentRoutes = require("./routes/studentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { migrateCommunityQuizzes } = require("./controllers/quizController");
const { seedAdminAndMigrate } = require("./config/adminSeeder");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ==========================================
// Environment & Configuration Validation
// ==========================================
const validateEnvironment = () => {
  const missing = [];
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) missing.push("MONGODB_URI or MONGO_URI");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    console.error("=================================================");
    console.error("FATAL: Missing Required Production Configuration!");
    console.error(`Missing variable(s): ${missing.join(", ")}`);
    console.error("Please configure these in your Render Dashboard / Environment.");
    console.error("=================================================");
    process.exit(1);
  }
};

// ==========================================
// CORS Configuration
// ==========================================
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000"
];

const configuredOrigins = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "")
  .split(",")
  .map(url => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/+$/, "");

    // Check against explicit allowed list
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    // Allow *.onrender.com frontends automatically
    if (normalized.endsWith(".onrender.com")) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked request from origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600
};

// ==========================================
// Middleware
// ==========================================
app.use(express.json());
app.use(cors(corsOptions));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ==========================================
// Health Check & Root Endpoints
// ==========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Online Quiz Application Backend",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.status(200).send("Online Quiz Backend Running");
});

// ==========================================
// Application API Routes
// ==========================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", require("./routes/quizRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/profile", profileRoutes);
app.use("/api/manage", manageQuestionRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);

// ==========================================
// Centralized Error Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }
  console.error("[Server Error]", err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
  });
});

// ==========================================
// Initialization & Server Startup
// ==========================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    // 1. Verify required environment variables
    validateEnvironment();

    // 2. Connect to MongoDB Atlas / Database
    await connectDB();

    // 3. Run essential seeders and data migrations
    await seedAdminAndMigrate();
    await migrateCommunityQuizzes();

    // 4. Start HTTP Server only after successful initialization
    app.listen(PORT, HOST, () => {
      console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://${HOST}:${PORT}`);
    });
  } catch (err) {
    console.error("FATAL: Server startup aborted due to initialization error:", err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;