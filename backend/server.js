const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

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
dotenv.config();

connectDB().then(async () => {
  await seedAdminAndMigrate();
  await migrateCommunityQuizzes();
});

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan("dev"));
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
app.get("/",(req,res)=>{

    res.send(
        "Online Quiz Backend Running"
    );

});

const PORT =
process.env.PORT || 5000;

app.listen(PORT,()=>{

    console.log(
        `Server Running On ${PORT}`
    );

});