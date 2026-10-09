import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import { CATEGORIES, getCategoryIcon } from "../../utils/categories.js";

const AvailableQuizzes = () => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [studentInterests, setStudentInterests] = useState([]);
    const [requiresInterests, setRequiresInterests] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const data = await apiFetch("/quiz/published");
            setQuizzes(data.quizzes || []);
            setStudentInterests(data.studentInterests || []);
            setRequiresInterests(data.requiresInterests || false);
        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to load quizzes.");
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter((quiz) => {
        const matchesSearch =
            quiz.title.toLowerCase().includes(search.toLowerCase()) ||
            (quiz.examinerName || "").toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            categoryFilter === "all" ||
            quiz.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    return (
        <main className="page-shell" style={{ padding: "30px 0 60px" }}>
            <section className="card-panel">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", marginBottom: "20px" }}>
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate("/aspirant")}
                            style={{ marginBottom: "12px", padding: "8px 14px", fontSize: "0.85rem" }}
                        >
                            ← Back to Dashboard
                        </button>
                        <br />
                        <span className="eyebrow">
                            🎯 Interest-Based Recommended Exams
                        </span>
                        <h1 style={{ marginTop: "8px" }}>Recommended Quizzes</h1>
                        <p style={{ color: "var(--muted)", marginTop: "4px" }}>
                            These standard exams match your selected categories of interest.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline"
                        onClick={() => navigate("/aspirant/select-interests")}
                        style={{ padding: "10px 18px" }}
                    >
                        ⚙️ Manage Interests ({studentInterests.length})
                    </button>
                </div>

                {/* Active Interests Bar */}
                {studentInterests.length > 0 && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        padding: "12px 18px",
                        background: "var(--surface-soft)",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        marginBottom: "25px"
                    }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--muted)" }}>
                            Filtered by Interests:
                        </span>
                        {studentInterests.map((interest, idx) => (
                            <span
                                key={idx}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: "var(--primary-soft)",
                                    color: "var(--primary)",
                                    padding: "4px 10px",
                                    borderRadius: "999px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600"
                                }}
                            >
                                {getCategoryIcon(interest)} {interest}
                            </span>
                        ))}
                    </div>
                )}

                {/* Search & Filter Bar */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "14px",
                    marginBottom: "30px",
                    background: "var(--surface-soft)",
                    padding: "16px",
                    borderRadius: "18px",
                    border: "1px solid var(--border)"
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Search quiz title or examiner..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: "var(--surface)" }}
                    />

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                            width: "100%",
                            border: "1px solid var(--border)",
                            borderRadius: "18px",
                            padding: "14px 16px",
                            background: "var(--surface)",
                            font: "inherit"
                        }}
                    >
                        <option value="all">All Selected Interests</option>
                        {studentInterests.map((catName, idx) => (
                            <option key={idx} value={catName}>
                                {getCategoryIcon(catName)} {catName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <h2>Loading recommended quizzes...</h2>
                    </div>
                ) : requiresInterests || studentInterests.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        background: "var(--surface-soft)",
                        borderRadius: "20px",
                        border: "1.5px dashed var(--border)"
                    }}>
                        <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "12px" }}>🎯</span>
                        <h2>Please select your interests to see recommended exams</h2>
                        <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "10px auto 25px" }}>
                            Choose your preferred subjects (Programming, Mathematics, Science, Medical, etc.) to view tailored exams.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/aspirant/select-interests")}
                        >
                            Select Your Interests Now
                        </button>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        background: "var(--surface-soft)",
                        borderRadius: "20px",
                        border: "1.5px dashed var(--border)"
                    }}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>📚</span>
                        <h2>No matching exams found</h2>
                        <p style={{ color: "var(--muted)", margin: "8px 0 20px" }}>
                            {search || categoryFilter !== "all"
                                ? "No exams match your current search and filter criteria."
                                : `No published exams match your interests (${studentInterests.join(", ")}).`}
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            {(search || categoryFilter !== "all") && (
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setSearch("");
                                        setCategoryFilter("all");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/aspirant/select-interests")}
                            >
                                Adjust Interests
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px"
                    }}>
                        {filteredQuizzes.map((quiz) => {
                            const icon = getCategoryIcon(quiz.category);
                            return (
                                <div
                                    key={quiz._id}
                                    className="control-card"
                                    style={{
                                        border: "1.5px solid var(--border)",
                                        borderRadius: "20px",
                                        padding: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <div>
                                        {/* Category Badge & Type */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                background: "var(--primary-soft)",
                                                color: "var(--primary)",
                                                padding: "4px 10px",
                                                borderRadius: "999px",
                                                fontSize: "0.8rem",
                                                fontWeight: "700"
                                            }}>
                                                {icon} {quiz.category || "General"}
                                            </span>

                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                fontSize: "0.75rem",
                                                fontWeight: "700",
                                                background: quiz.isPrivate ? "rgba(255, 123, 82, 0.12)" : "rgba(34, 197, 94, 0.12)",
                                                color: quiz.isPrivate ? "#ff7b52" : "#16a34a"
                                            }}>
                                                {quiz.isPrivate ? "🔒 Private" : "🌍 Public"}
                                            </span>
                                        </div>

                                        <h2 style={{ margin: "0 0 10px", fontSize: "1.3rem" }}>{quiz.title}</h2>

                                        <div style={{
                                            background: "var(--surface-soft)",
                                            padding: "12px",
                                            borderRadius: "12px",
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "8px",
                                            fontSize: "0.85rem",
                                            marginBottom: "16px"
                                        }}>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>EXAMINER</span>
                                                <strong>👨‍🏫 {quiz.examinerName}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>TIME LIMIT</span>
                                                <strong>⏱ {quiz.timeLimit} Mins</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>QUESTIONS</span>
                                                <strong>❓ {quiz.totalQuestions || 0} Questions</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>ATTEMPTS</span>
                                                <strong>{quiz.oneAttemptOnly ? "Single Attempt" : "Multiple"}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                                        {quiz.isPrivate ? (
                                            <button
                                                className="btn btn-outline btn-block"
                                                onClick={() =>
                                                    navigate(
                                                        `/aspirant/private-quiz/${quiz._id}`
                                                    )
                                                }
                                            >
                                                🔑 Enter Quiz Code
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-primary btn-block"
                                                onClick={() =>
                                                    navigate(
                                                        `/aspirant/attempt-quiz/${quiz._id}`
                                                    )
                                                }
                                            >
                                                🚀 Start Quiz
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
};

export default AvailableQuizzes;