import { useNavigate } from "react-router-dom";

const CommunityQuizCard = ({ quiz }) => {

    const navigate = useNavigate();

    return (

        <div
            className="control-card"
            style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "15px"
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap"
                }}
            >

                <div>

                    <h2 style={{ marginBottom: "10px" }}>
                        {quiz.title}
                    </h2>

                    <p>
                        👨‍🏫 <strong>Created By:</strong> {quiz.examinerName}
                    </p>

                    <p>
                        📝 <strong>Quiz Code:</strong> {quiz.quizCode || "N/A"}
                    </p>

                    <p>
                        ⏱ <strong>Time:</strong> {quiz.timeLimit} Minutes
                    </p>

                    <p>
                        ❓ <strong>Questions:</strong> {quiz.totalQuestions || 0}
                    </p>

                    <p>

                        👥 <strong>Attempts :</strong>{" "}{quiz.totalAttempts}

                    </p>

                    <p>

                        📈 <strong>Average Score :</strong>{" "}{quiz.averageScore}%

                    </p>

                    <p>
                        📅 <strong>Created:</strong>{" "}
                        {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>

                </div>

                <div>

                    <span
                        style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            background: quiz.isPublished
                                ? "#d4edda"
                                : "#fff3cd",
                            color: quiz.isPublished
                                ? "#155724"
                                : "#856404",
                            fontWeight: "bold"
                        }}
                    >
                        {quiz.isPublished ? "🟢 Published" : "🟡 Draft"}
                    </span>

                </div>

            </div>

            <hr />

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap"
                }}
            >

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate(`/examiner/manage-questions/${quiz._id}`)
                    }
                >
                    View Questions
                </button>

                <button
                    className="btn btn-outline"
                    onClick={() =>
                        navigate(`/examiner/view-results?quiz=${quiz._id}`)
                    }
                >
                    Results
                </button>

                {!quiz.isPublished && (
                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            navigate(`/examiner/question-builder/${quiz._id}`)
                        }
                    >
                        Continue Editing
                    </button>
                )}

            </div>

        </div>

    );

};

export default CommunityQuizCard;