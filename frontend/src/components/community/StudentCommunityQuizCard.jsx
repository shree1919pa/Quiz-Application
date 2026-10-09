import { useNavigate } from "react-router-dom";
import { getCategoryIcon } from "../../utils/categories.js";

const StudentCommunityQuizCard = ({ quiz }) => {
    const navigate = useNavigate();

    const categoryIcon = getCategoryIcon(quiz.category);

    const handleStartQuiz = () => {
        if (quiz.isPrivate) {
            navigate(`/aspirant/private-quiz/${quiz._id}`);
        } else {
            navigate(`/aspirant/attempt-quiz/${quiz._id}`);
        }
    };

    return (
        <div
            className="control-card"
            style={{
                border: "1.5px solid var(--border)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "var(--surface)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 6px 18px rgba(17, 33, 71, 0.05)"
            }}
        >
            <div>
                {/* Header with Category & Type Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "var(--primary-soft)",
                        color: "var(--primary)",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "0.8rem",
                        fontWeight: "700"
                    }}>
                        {categoryIcon} {quiz.category || "General"}
                    </span>

                    <span style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: quiz.isPrivate ? "rgba(255, 123, 82, 0.12)" : "rgba(34, 197, 94, 0.12)",
                        color: quiz.isPrivate ? "#ff7b52" : "#16a34a"
                    }}>
                        {quiz.isPrivate ? "🔒 Private Quiz" : "🌍 Public Community Quiz"}
                    </span>
                </div>

                {/* Quiz Title */}
                <h3 style={{ margin: "0 0 10px", fontSize: "1.3rem", color: "var(--text)" }}>
                    {quiz.title}
                </h3>

                {/* Community Badge */}
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(14, 165, 233, 0.1)",
                    color: "#0284c7",
                    padding: "6px 12px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginBottom: "16px"
                }}>
                    👥 {quiz.communityName || "Community Quiz"}
                </div>

                {/* Info Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "20px",
                    background: "var(--surface-soft)",
                    padding: "14px",
                    borderRadius: "14px",
                    fontSize: "0.88rem"
                }}>
                    <div>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>CREATED BY</span>
                        <strong style={{ color: "var(--text)" }}>👨‍🏫 {quiz.examinerName || "Examiner"}</strong>
                    </div>

                    <div>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>TIME LIMIT</span>
                        <strong style={{ color: "var(--text)" }}>⏱ {quiz.timeLimit} Minutes</strong>
                    </div>

                    <div>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>TOTAL QUESTIONS</span>
                        <strong style={{ color: "var(--text)" }}>❓ {quiz.totalQuestions || 0} Questions</strong>
                    </div>

                    <div>
                        <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>STATUS</span>
                        <strong style={{ color: "#16a34a" }}>🟢 Available</strong>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <button
                    className={`btn ${quiz.isPrivate ? "btn-outline" : "btn-primary"} btn-block`}
                    onClick={handleStartQuiz}
                    style={{ fontSize: "0.95rem" }}
                >
                    {quiz.isPrivate ? "🔑 Enter Quiz Code" : "🚀 Start Quiz"}
                </button>
            </div>
        </div>
    );
};

export default StudentCommunityQuizCard;
