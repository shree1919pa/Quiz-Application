import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

import Login from "../pages/auth/Login.jsx";
import RegisterExaminer from "../pages/auth/RegisterExaminer.jsx";
import RegisterAspirant from "../pages/auth/RegisterAspirant.jsx";

// Admin
import AdminLogin from "../pages/admin/AdminLogin.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ExaminerApprovals from "../pages/admin/ExaminerApprovals.jsx";
import UserManagement from "../pages/admin/UserManagement.jsx";
import ExaminersList from "../pages/admin/ExaminersList.jsx";
import ExaminerProfile from "../pages/admin/ExaminerProfile.jsx";
import AspirantsList from "../pages/admin/AspirantsList.jsx";
import AspirantProfile from "../pages/admin/AspirantProfile.jsx";
import AdminCommunities from "../pages/admin/AdminCommunities.jsx";
import AdminCommunityDetails from "../pages/admin/AdminCommunityDetails.jsx";
import AdminQuizManagement from "../pages/admin/AdminQuizManagement.jsx";
import AdminQuizDetails from "../pages/admin/AdminQuizDetails.jsx";
import AdminAnalytics from "../pages/admin/AdminAnalytics.jsx";
import AdminProfile from "../pages/admin/AdminProfile.jsx";

// Examiner
import ExaminerDashboard from "../pages/examiner/ExaminerDashboard.jsx";
import CreateQuiz from "../pages/examiner/CreateQuiz.jsx";
import QuestionBuilder from "../pages/examiner/QuestionBuilder.jsx";
import ManageQuestions from "../pages/examiner/ManageQuestions.jsx";
import ViewResults from "../pages/examiner/ViewResults.jsx";

// Aspirant
import AspirantDashboard from "../pages/aspirant/AspirantDashboard.jsx";
import AvailableQuizzes from "../pages/aspirant/AvailableQuizzes.jsx";
import SelectInterests from "../pages/aspirant/SelectInterests.jsx";
import StudentCommunityQuizzes from "../pages/aspirant/StudentCommunityQuizzes.jsx";
import AspirantDiscoverCommunities from "../pages/aspirant/DiscoverCommunities.jsx";
import AspirantMyCommunities from "../pages/aspirant/MyCommunities.jsx";
import AspirantCommunityDetails from "../pages/aspirant/CommunityDetails.jsx";
import PrivateQuiz from "../pages/aspirant/PrivateQuiz.jsx";
import AttemptQuiz from "../pages/aspirant/AttemptQuiz.jsx";
import Results from "../pages/aspirant/Results.jsx";
import MyPerformance from "../pages/aspirant/MyPerformance";
import PerformanceDetails from "../pages/aspirant/PerformanceDetails";
import CommunityDetails from "../pages/examiner/CommunityDetails";
import QuizCommunities from "../pages/examiner/QuizCommunities";
import DiscoverCommunities from "../pages/examiner/DiscoverCommunities";
import CommunityMembers from "../pages/examiner/CommunityMembers";

import EditQuizQuestions from "../pages/examiner/EditQuizQuestions";
import Profile from "../pages/Profile.jsx";

const AppRoutes = () => {
    const { isAuthenticated, role } = useAuth();

    return (
        <>
            <Navbar />

            <Routes>
                {/* Authentication */}
                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                />

                <Route
                    path="/register-examiner"
                    element={<RegisterExaminer />}
                />

                <Route
                    path="/register-aspirant"
                    element={<RegisterAspirant />}
                />

                {/* ================= Admin Routes ================= */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/examiner-approvals"
                    element={
                        <ProtectedRoute role="admin">
                            <ExaminerApprovals />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute role="admin">
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/examiners"
                    element={
                        <ProtectedRoute role="admin">
                            <ExaminersList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/examiners/:id"
                    element={
                        <ProtectedRoute role="admin">
                            <ExaminerProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/aspirants"
                    element={
                        <ProtectedRoute role="admin">
                            <AspirantsList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/aspirants/:id"
                    element={
                        <ProtectedRoute role="admin">
                            <AspirantProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/communities"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/communities/:id"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminCommunityDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/quizzes"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminQuizManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/quizzes/:id"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminQuizDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/analytics"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminAnalytics />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/profile"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />

                {/* ================= Examiner ================= */}
                <Route
                    path="/examiner"
                    element={
                        <ProtectedRoute role="examiner">
                            <ExaminerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/create-quiz"
                    element={
                        <ProtectedRoute role="examiner">
                            <CreateQuiz />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/question-builder/:quizId"
                    element={
                        <ProtectedRoute role="examiner">
                            <QuestionBuilder />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/manage-questions"
                    element={
                        <ProtectedRoute role="examiner">
                            <ManageQuestions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/manage-questions/:quizId"
                    element={
                        <ProtectedRoute role="examiner">
                            <EditQuizQuestions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/view-results"
                    element={
                        <ProtectedRoute role="examiner">
                            <ViewResults />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/profile"
                    element={
                        <ProtectedRoute role="examiner">
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/quiz-communities/:communityId"
                    element={
                        <ProtectedRoute role="examiner">
                            <CommunityDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/quiz-communities"
                    element={
                        <ProtectedRoute role="examiner">
                            <QuizCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/discover-communities"
                    element={
                        <ProtectedRoute role="examiner">
                            <DiscoverCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/examiner/community/:communityId/members"
                    element={
                        <ProtectedRoute role="examiner">
                            <CommunityMembers />
                        </ProtectedRoute>
                    }
                />

                {/* ================= Aspirant ================= */}
                <Route
                    path="/aspirant"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/select-interests"
                    element={
                        <ProtectedRoute role="aspirant">
                            <SelectInterests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/select-interests"
                    element={
                        <ProtectedRoute role="aspirant">
                            <SelectInterests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/discover-communities"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantDiscoverCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/discover-communities"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantDiscoverCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/join-community"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantDiscoverCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/my-communities"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantMyCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/my-communities"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantMyCommunities />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/community/:communityId"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantCommunityDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/community/:communityId"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AspirantCommunityDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/community-quizzes"
                    element={
                        <ProtectedRoute role="aspirant">
                            <StudentCommunityQuizzes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/community-quizzes"
                    element={
                        <ProtectedRoute role="aspirant">
                            <StudentCommunityQuizzes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/available-quizzes"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AvailableQuizzes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/available-quizzes"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AvailableQuizzes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/quizzes"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AvailableQuizzes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/private-quiz/:quizId"
                    element={
                        <ProtectedRoute role="aspirant">
                            <PrivateQuiz />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/attempt-quiz/:quizId"
                    element={
                        <ProtectedRoute role="aspirant">
                            <AttemptQuiz />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/results"
                    element={
                        <ProtectedRoute role="aspirant">
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/my-performance"
                    element={
                        <ProtectedRoute role="aspirant">
                            <MyPerformance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/profile"
                    element={
                        <ProtectedRoute role="aspirant">
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/aspirant/performance/:attemptId"
                    element={
                        <ProtectedRoute role="aspirant">
                            <PerformanceDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Default Redirect */}
                <Route
                    path="*"
                    element={
                        isAuthenticated ? (
                            role === "admin" ? (
                                <Navigate to="/admin/dashboard" replace />
                            ) : role === "examiner" ? (
                                <Navigate to="/examiner" replace />
                            ) : (
                                <Navigate to="/aspirant" replace />
                            )
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
            </Routes>

            <Footer />
        </>
    );
};

export default AppRoutes;