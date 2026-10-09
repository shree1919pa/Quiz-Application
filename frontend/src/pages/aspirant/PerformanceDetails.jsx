import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";
import AIExplanationCard from "../../components/AIExplanationCard";

const PerformanceDetails = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    // AI Explanation states mapped by questionId
    const [explanations, setExplanations] = useState({});
    const [loadingAI, setLoadingAI] = useState({});
    const [errorAI, setErrorAI] = useState({});

    useEffect(() => {
        if (attemptId) {
            loadReportAndExplanations();
        }
    }, [attemptId]);

    const loadReportAndExplanations = async () => {
        try {
            setLoading(true);

            // Fetch attempt report
            const data = await apiFetch(`/performance/${attemptId}`);
            setAttempt(data.attempt);

            // Fetch any existing cached explanations for this attempt
            try {
                const expData = await apiFetch(`/ai/explanations/${attemptId}`);
                if (expData.success && Array.isArray(expData.explanations)) {
                    const expMap = {};
                    expData.explanations.forEach((item) => {
                        if (item.questionId) {
                            const qId = typeof item.questionId === "object" ? item.questionId._id || item.questionId : item.questionId;
                            expMap[qId.toString()] = item;
                        }
                    });
                    setExplanations(expMap);
                }
            } catch (expErr) {
                console.log("[AI Cache Fetch]", expErr.message);
            }
        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to load report.");
        } finally {
            setLoading(false);
        }
    };

    const handleExplainWithAI = async (questionId) => {
        if (!questionId) return;

        setLoadingAI((prev) => ({ ...prev, [questionId]: true }));
        setErrorAI((prev) => ({ ...prev, [questionId]: "" }));

        try {
            const data = await apiFetch("/ai/explain-question", {
                method: "POST",
                body: JSON.stringify({
                    attemptId,
                    questionId
                })
            });

            if (data.success && data.explanation) {
                setExplanations((prev) => ({
                    ...prev,
                    [questionId]: data.explanation
                }));
            } else {
                throw new Error(data.message || "Failed to generate explanation.");
            }
        } catch (err) {
            console.error("[Explain AI Error]", err);
            setErrorAI((prev) => ({
                ...prev,
                [questionId]: err.message || "AI explanation is temporarily unavailable. Please try again."
            }));
        } finally {
            setLoadingAI((prev) => ({ ...prev, [questionId]: false }));
        }
    };

    if (loading) {
        return (
            <main className="page-shell">
                <section className="card-panel">
                    <h2>Loading Report...</h2>
                </section>
            </main>
        );
    }

    if (!attempt) {
        return (
            <main className="page-shell">
                <section className="card-panel">
                    <h2>Report Not Found</h2>
                    <br />
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                </section>
            </main>
        );
    }

    const totalQuestions = attempt.answers?.length || 0;
    const correctCount = attempt.answers?.filter((a) => a.isCorrect).length || 0;
    const wrongCount = totalQuestions - correctCount;

    return (
        <main className="page-shell">
            <section className="card-panel">
                <button
                    className="btn btn-outline"
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: "15px" }}
                >
                    ← Back to Performance
                </button>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "15px",
                        marginBottom: "10px"
                    }}
                >
                    <div>
                        <span className="eyebrow">Detailed Evaluation</span>
                        <h1 style={{ margin: "5px 0" }}>Performance Report</h1>
                    </div>

                    <span
                        style={{
                            padding: "8px 20px",
                            borderRadius: "24px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "#fff",
                            background: attempt.percentage >= 40 ? "#16a34a" : "#dc2626",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                    >
                        {attempt.percentage >= 40 ? "PASS" : "FAIL"}
                    </span>
                </div>

                <hr />

                {/* Performance Summary Metrics */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "16px",
                        marginTop: "20px",
                        marginBottom: "30px"
                    }}
                >
                    <div className="control-card">
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Quiz Title</span>
                        <h3 style={{ margin: "6px 0 0 0" }}>{attempt.quizId?.title || "Quiz"}</h3>
                    </div>

                    <div className="control-card">
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Quiz Code</span>
                        <h3 style={{ margin: "6px 0 0 0" }}>{attempt.quizId?.quizCode || "N/A"}</h3>
                    </div>

                    <div className="control-card">
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Final Score</span>
                        <h3 style={{ margin: "6px 0 0 0", color: "var(--primary)" }}>
                            {attempt.score} / {attempt.totalMarks}
                        </h3>
                    </div>

                    <div className="control-card">
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Percentage</span>
                        <h3 style={{ margin: "6px 0 0 0" }}>{attempt.percentage}%</h3>
                    </div>

                    <div className="control-card">
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Correct / Wrong</span>
                        <h3 style={{ margin: "6px 0 0 0" }}>
                            <span style={{ color: "#16a34a" }}>{correctCount} Correct</span>
                            {" / "}
                            <span style={{ color: "#dc2626" }}>{wrongCount} Wrong</span>
                        </h3>
                    </div>

                    <div className="control-card">
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Attempt Date</span>
                        <p style={{ margin: "6px 0 0 0", fontSize: "0.95rem", fontWeight: "600" }}>
                            {new Date(attempt.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "40px",
                        marginBottom: "15px"
                    }}
                >
                    <h2>Question-Wise Analysis</h2>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                        Click <strong>Explain with AI</strong> on any question for deep learning insights
                    </span>
                </div>

                <hr />

                {/* Question by Question Review */}
                {attempt.answers.map((answer, index) => {
                    const questionObj = answer.questionId;
                    const questionId = questionObj?._id || answer.questionId;
                    const qIdStr = questionId ? questionId.toString() : `q_${index}`;

                    const questionText = questionObj?.question || "Question information unavailable";
                    const options = questionObj?.options || [];
                    const correctAnswer = questionObj?.correctAnswer || "N/A";
                    const selectedAnswer = answer.selectedAnswer?.trim() || "";
                    const isAttempted = Boolean(selectedAnswer);
                    const isCorrect = Boolean(answer.isCorrect);

                    const explanation = explanations[qIdStr];
                    const isAILoading = loadingAI[qIdStr];
                    const aiError = errorAI[qIdStr];

                    return (
                        <div
                            key={answer._id || index}
                            className="control-card"
                            style={{
                                marginBottom: "24px",
                                borderLeft: `6px solid ${
                                    isCorrect ? "#16a34a" : isAttempted ? "#dc2626" : "#f59e0b"
                                }`,
                                transition: "transform 0.2s ease, box-shadow 0.2s ease"
                            }}
                        >
                            {/* Question Header & Status */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                    marginBottom: "12px"
                                }}
                            >
                                <h3 style={{ margin: 0, color: "var(--text)" }}>
                                    Question {index + 1}
                                </h3>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <span
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "bold",
                                            color: "var(--muted)",
                                            background: "rgba(0,0,0,0.04)",
                                            padding: "4px 10px",
                                            borderRadius: "12px"
                                        }}
                                    >
                                        Marks: {questionObj?.marks || 1}
                                    </span>

                                    <span
                                        style={{
                                            padding: "5px 14px",
                                            borderRadius: "16px",
                                            fontWeight: "bold",
                                            fontSize: "0.85rem",
                                            color: isCorrect ? "#166534" : isAttempted ? "#991b1b" : "#854d0e",
                                            background: isCorrect ? "#dcfce7" : isAttempted ? "#fee2e2" : "#fef3c7"
                                        }}
                                    >
                                        {isCorrect
                                            ? "✓ Correct"
                                            : isAttempted
                                            ? "❌ Incorrect"
                                            : "⚪ Not Attempted"}
                                    </span>
                                </div>
                            </div>

                            {/* Question Text */}
                            <p
                                style={{
                                    fontSize: "1.05rem",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    lineHeight: "1.6",
                                    marginBottom: "16px"
                                }}
                            >
                                {questionText}
                            </p>

                            {/* Options List (if MCQ) */}
                            {options.length > 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "8px",
                                        marginBottom: "18px",
                                        background: "rgba(0, 0, 0, 0.02)",
                                        padding: "12px 16px",
                                        borderRadius: "12px"
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "0.82rem",
                                            fontWeight: "700",
                                            textTransform: "uppercase",
                                            color: "var(--muted)",
                                            marginBottom: "4px"
                                        }}
                                    >
                                        Options:
                                    </span>
                                    {options.map((opt, optIdx) => {
                                        const isOptionCorrect =
                                            opt === correctAnswer ||
                                            correctAnswer.startsWith(`${String.fromCharCode(65 + optIdx)}. `) ||
                                            opt.startsWith(`${correctAnswer}. `);

                                        const isOptionSelected =
                                            opt === selectedAnswer ||
                                            selectedAnswer.startsWith(`${String.fromCharCode(65 + optIdx)}. `) ||
                                            opt.startsWith(`${selectedAnswer}. `);

                                        let borderStyle = "1px solid rgba(0,0,0,0.08)";
                                        let bgStyle = "#ffffff";

                                        if (isOptionCorrect) {
                                            borderStyle = "2px solid #16a34a";
                                            bgStyle = "#f0fdf4";
                                        } else if (isOptionSelected && !isCorrect) {
                                            borderStyle = "2px solid #dc2626";
                                            bgStyle = "#fef2f2";
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "8px 14px",
                                                    borderRadius: "8px",
                                                    border: borderStyle,
                                                    background: bgStyle,
                                                    fontSize: "0.92rem"
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span
                                                        style={{
                                                            fontWeight: "bold",
                                                            color: isOptionCorrect ? "#16a34a" : isOptionSelected ? "#dc2626" : "var(--muted)",
                                                            minWidth: "22px"
                                                        }}
                                                    >
                                                        {String.fromCharCode(65 + optIdx)}.
                                                    </span>
                                                    <span>{opt}</span>
                                                </div>

                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    {isOptionSelected && (
                                                        <span
                                                            style={{
                                                                fontSize: "0.75rem",
                                                                fontWeight: "700",
                                                                padding: "2px 8px",
                                                                borderRadius: "10px",
                                                                background: isCorrect ? "#16a34a" : "#dc2626",
                                                                color: "#ffffff"
                                                            }}
                                                        >
                                                            Your Choice
                                                        </span>
                                                    )}
                                                    {isOptionCorrect && (
                                                        <span
                                                            style={{
                                                                fontSize: "0.75rem",
                                                                fontWeight: "700",
                                                                padding: "2px 8px",
                                                                borderRadius: "10px",
                                                                background: "#16a34a",
                                                                color: "#ffffff"
                                                            }}
                                                        >
                                                            Correct Answer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Answers Breakdown Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "12px",
                                    background: "#f8fafc",
                                    padding: "12px 16px",
                                    borderRadius: "12px",
                                    marginBottom: "16px"
                                }}
                            >
                                <div>
                                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Student Answer:</span>
                                    <p
                                        style={{
                                            margin: "4px 0 0 0",
                                            fontWeight: "700",
                                            color: isCorrect ? "#16a34a" : isAttempted ? "#dc2626" : "#64748b"
                                        }}
                                    >
                                        {selectedAnswer || "⚪ Not Answered"}
                                    </p>
                                </div>

                                <div>
                                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Correct Answer:</span>
                                    <p
                                        style={{
                                            margin: "4px 0 0 0",
                                            fontWeight: "700",
                                            color: "#16a34a"
                                        }}
                                    >
                                        ✓ {correctAnswer}
                                    </p>
                                </div>
                            </div>

                            {/* AI Explanation Area */}
                            {explanation ? (
                                <AIExplanationCard
                                    explanation={explanation}
                                    onRefresh={() => handleExplainWithAI(qIdStr)}
                                    isRefreshing={isAILoading}
                                />
                            ) : isAILoading ? (
                                <div
                                    style={{
                                        marginTop: "14px",
                                        padding: "16px",
                                        borderRadius: "12px",
                                        background: "linear-gradient(135deg, rgba(40, 88, 221, 0.08), rgba(123, 44, 191, 0.08))",
                                        border: "1px dashed #2858dd",
                                        textAlign: "center",
                                        color: "#2858dd",
                                        fontWeight: "600",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                >
                                    <span style={{ fontSize: "1.4rem" }}>🤖</span>
                                    <span>AI is analyzing this question and crafting your educational explanation...</span>
                                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                                        Evaluating concepts, options, and customized learning tips
                                    </span>
                                </div>
                            ) : aiError ? (
                                <div
                                    style={{
                                        marginTop: "14px",
                                        padding: "14px 16px",
                                        borderRadius: "12px",
                                        background: "#fef2f2",
                                        border: "1px solid #fecaca",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: "10px"
                                    }}
                                >
                                    <span style={{ color: "#991b1b", fontSize: "0.9rem" }}>
                                        ⚠️ {aiError}
                                    </span>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleExplainWithAI(qIdStr)}
                                        style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                                    >
                                        🔄 Try Again
                                    </button>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        marginTop: "14px",
                                        display: "flex",
                                        justifyContent: "flex-start"
                                    }}
                                >
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleExplainWithAI(qIdStr)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: "linear-gradient(135deg, #2858dd 0%, #7b2cbf 100%)",
                                            border: "none",
                                            boxShadow: "0 4px 14px rgba(40, 88, 221, 0.25)",
                                            padding: "10px 20px"
                                        }}
                                    >
                                        <span>🤖</span>
                                        <span>Explain with AI</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>
        </main>
    );
};

export default PerformanceDetails;