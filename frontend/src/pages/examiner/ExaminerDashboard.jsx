import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const ExaminerDashboard = () => {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [name, setName] = useState("Examiner");

    useEffect(() => {

        if (!user) return;

        setName(

            user.fullName ||

            user.name ||

            "Examiner"

        );

    }, [user]);

    const links = [

        {
            label: "Dashboard",
            path: "/examiner"
        },

        {
            label: "Create Quiz",
            path: "/examiner/create-quiz"
        },

        {
            label: "Quiz Communities",
            path: "/examiner/quiz-communities"
        },

        {
            label: "Manage Questions",
            path: "/examiner/manage-questions"
        },

        {
            label: "View Results",
            path: "/examiner/view-results"
        },

        {
            label: "Profile",
            path: "/examiner/profile"
        }

    ];

    return (

        <div className="dashboard-page">

            <Sidebar links={links} />

            <section className="dashboard-content">

                {/* Header */}

                <div className="dashboard-head">

                    <div>

                        <span className="eyebrow">

                            Welcome back

                        </span>

                        <h1>

                            {name}

                        </h1>

                        <p>

                            Manage quizzes, communities, questions and results from one place.

                        </p>

                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => {

                            logout();

                            navigate("/");

                        }}
                    >

                        Logout

                    </button>

                </div>

                {/* Dashboard Cards */}

                <div className="cards-grid">

                    {/* Create Quiz */}

                    <article
                        className="control-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate("/examiner/create-quiz")
                        }
                    >

                        <h3>

                            Create Quiz

                        </h3>

                        <p>

                            Design a new quiz with questions, timing and settings.

                        </p>

                    </article>

                    {/* Quiz Communities */}

                    <article
                        className="control-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate("/examiner/quiz-communities")
                        }
                    >

                        <h3>

                            Quiz Communities

                        </h3>

                        <p>

                            Create, join and manage quiz communities where multiple examiners can collaborate.

                        </p>

                    </article>

                    {/* Manage Questions */}

                    <article
                        className="control-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate("/examiner/manage-questions")
                        }
                    >

                        <h3>

                            Manage Questions

                        </h3>

                        <p>

                            Edit, update or delete questions from your quizzes.

                        </p>

                    </article>

                    {/* View Results */}

                    <article
                        className="control-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate("/examiner/view-results")
                        }
                    >

                        <h3>

                            View Results

                        </h3>

                        <p>

                            Review aspirant performance and quiz analytics.

                        </p>

                    </article>

                    {/* Profile */}

                    <article
                        className="control-card"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            navigate("/examiner/profile")
                        }
                    >

                        <h3>

                            Profile

                        </h3>

                        <p>

                            Update your profile information and account settings.

                        </p>

                    </article>

                </div>

            </section>

        </div>

    );

};

export default ExaminerDashboard;