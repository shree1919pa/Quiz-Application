import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import StudentCommunityQuizCard from "../../components/community/StudentCommunityQuizCard.jsx";
import { CATEGORIES } from "../../utils/categories.js";

const StudentCommunityQuizzes = () => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [joinedCommunitiesCount, setJoinedCommunitiesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState("grouped"); // "grouped" or "grid"

    useEffect(() => {
        fetchStudentCommunityQuizzes();
    }, []);

    const fetchStudentCommunityQuizzes = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await apiFetch("/student/community-quizzes");

            setQuizzes(data.quizzes || []);
            setCommunities(data.communities || []);
            setJoinedCommunitiesCount(data.joinedCommunitiesCount || 0);
        } catch (err) {
            console.error("Failed to load community quizzes:", err);
            setError(err.message || "Failed to load community quizzes.");
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredQuizzes = quizzes.filter(quiz => {
        const titleMatch = (quiz.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        const commMatch = (quiz.communityName || "").toLowerCase().includes(searchTerm.toLowerCase());
        const examinerMatch = (quiz.examinerName || "").toLowerCase().includes(searchTerm.toLowerCase());
        const searchMatches = titleMatch || commMatch || examinerMatch;

        const communityMatches = selectedCommunity === "all" || quiz.communityId === selectedCommunity;
        const categoryMatches = selectedCategory === "all" || quiz.category === selectedCategory;

        return searchMatches && communityMatches && categoryMatches;
    });

    // Grouping by community
    const groupedCommunities = communities.map(community => {
        const communityQuizzes = filteredQuizzes.filter(
            q => q.communityId?.toString() === community._id?.toString()
        );
        return {
            ...community,
            quizzes: communityQuizzes
        };
    }).filter(c => selectedCommunity === "all" ? true : c._id === selectedCommunity);

    return (
        <main className="page-shell" style={{ padding: "30px 0 60px" }}>
            <section className="card-panel">
                {/* Header Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", marginBottom: "25px" }}>
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
                            👥 Joined Communities Quizzes
                        </span>
                        <h1 style={{ marginTop: "8px" }}>👥 Community Quizzes</h1>
                        <p style={{ color: "var(--muted)", marginTop: "4px" }}>
                            View and attempt exclusive quizzes available in your joined learning communities.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <button
                            className={`btn ${viewMode === "grouped" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setViewMode("grouped")}
                            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                        >
                            📑 By Community
                        </button>
                        <button
                            className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => setViewMode("grid")}
                            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
                        >
                            🔲 All Quizzes Grid
                        </button>
                    </div>
                </div>

                {/* Statistics Bar */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "30px"
                }}>
                    <div className="control-card" style={{ padding: "16px 20px", background: "var(--surface-soft)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>
                            Joined Communities
                        </span>
                        <h2 style={{ margin: "6px 0 0", color: "var(--primary)", fontSize: "1.8rem" }}>
                            {joinedCommunitiesCount}
                        </h2>
                    </div>

                    <div className="control-card" style={{ padding: "16px 20px", background: "var(--surface-soft)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>
                            Available Quizzes
                        </span>
                        <h2 style={{ margin: "6px 0 0", color: "#16a34a", fontSize: "1.8rem" }}>
                            {quizzes.length}
                        </h2>
                    </div>

                    <div className="control-card" style={{ padding: "16px 20px", background: "var(--surface-soft)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>
                            Matching Search
                        </span>
                        <h2 style={{ margin: "6px 0 0", color: "var(--text)", fontSize: "1.8rem" }}>
                            {filteredQuizzes.length}
                        </h2>
                    </div>
                </div>

                {/* Search & Filter Controls */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: "14px",
                    marginBottom: "30px",
                    background: "var(--surface-soft)",
                    padding: "16px",
                    borderRadius: "18px",
                    border: "1px solid var(--border)"
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by quiz title, community, or examiner..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: "var(--surface)" }}
                    />

                    <select
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        style={{
                            width: "100%",
                            border: "1px solid var(--border)",
                            borderRadius: "18px",
                            padding: "14px 16px",
                            background: "var(--surface)",
                            font: "inherit"
                        }}
                    >
                        <option value="all">All Communities ({communities.length})</option>
                        {communities.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            width: "100%",
                            border: "1px solid var(--border)",
                            borderRadius: "18px",
                            padding: "14px 16px",
                            background: "var(--surface)",
                            font: "inherit"
                        }}
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Error Banner */}
                {error && <div className="error-message" style={{ marginBottom: "20px" }}>{error}</div>}

                {/* Content Area */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <h2>Loading community quizzes...</h2>
                    </div>
                ) : joinedCommunitiesCount === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        background: "var(--surface-soft)",
                        borderRadius: "20px",
                        border: "1px dashed var(--border)"
                    }}>
                        <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "15px" }}>👥</span>
                        <h2>You haven't joined any communities yet</h2>
                        <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "10px auto 25px" }}>
                            Join examiner communities using a community code to unlock exclusive quizzes, study groups, and tests.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/aspirant")}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        background: "var(--surface-soft)",
                        borderRadius: "20px",
                        border: "1px dashed var(--border)"
                    }}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>📝</span>
                        <h2>No community quizzes found</h2>
                        <p style={{ color: "var(--muted)", margin: "8px 0 20px" }}>
                            {searchTerm || selectedCommunity !== "all" || selectedCategory !== "all"
                                ? "No quizzes match your active search filters. Try clearing your filters."
                                : "No quizzes are currently published in your joined communities."}
                        </p>
                        {(searchTerm || selectedCommunity !== "all" || selectedCategory !== "all") && (
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCommunity("all");
                                    setSelectedCategory("all");
                                }}
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : viewMode === "grid" ? (
                    /* Grid View of all Quizzes */
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px"
                    }}>
                        {filteredQuizzes.map(quiz => (
                            <StudentCommunityQuizCard key={quiz._id} quiz={quiz} />
                        ))}
                    </div>
                ) : (
                    /* Grouped by Community View */
                    <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
                        {groupedCommunities.map(community => {
                            if (community.quizzes.length === 0 && selectedCommunity === "all" && (searchTerm || selectedCategory !== "all")) {
                                return null;
                            }

                            return (
                                <div
                                    key={community._id}
                                    style={{
                                        background: "var(--surface-soft)",
                                        border: "1.5px solid var(--border)",
                                        borderRadius: "22px",
                                        padding: "26px"
                                    }}
                                >
                                    {/* Community Header */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        flexWrap: "wrap",
                                        gap: "12px",
                                        marginBottom: "18px",
                                        paddingBottom: "16px",
                                        borderBottom: "1px solid var(--border)"
                                    }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                <h2 style={{ margin: 0, fontSize: "1.4rem", color: "var(--text)" }}>
                                                    👥 {community.name}
                                                </h2>
                                                <span style={{
                                                    background: "var(--primary-soft)",
                                                    color: "var(--primary)",
                                                    padding: "3px 10px",
                                                    borderRadius: "999px",
                                                    fontSize: "0.78rem",
                                                    fontWeight: "700"
                                                }}>
                                                    {community.category || "General"}
                                                </span>
                                            </div>

                                            {community.description && (
                                                <p style={{ color: "var(--muted)", margin: "6px 0 0", fontSize: "0.92rem" }}>
                                                    {community.description}
                                                </p>
                                            )}
                                        </div>

                                        <span style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "700",
                                            background: community.quizzes.length > 0 ? "rgba(34, 197, 94, 0.12)" : "rgba(100, 116, 139, 0.12)",
                                            color: community.quizzes.length > 0 ? "#16a34a" : "var(--muted)",
                                            padding: "6px 14px",
                                            borderRadius: "999px"
                                        }}>
                                            📝 {community.quizzes.length} Quiz{community.quizzes.length === 1 ? "" : "zes"} Available
                                        </span>
                                    </div>

                                    {/* Community Quizzes List */}
                                    {community.quizzes.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "25px 15px", color: "var(--muted)" }}>
                                            <em>No published quizzes currently available in this community.</em>
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                                            gap: "20px"
                                        }}>
                                            {community.quizzes.map(quiz => (
                                                <StudentCommunityQuizCard key={quiz._id} quiz={quiz} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
};

export default StudentCommunityQuizzes;
