import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import { getCategoryIcon } from "../../utils/categories.js";

const DiscoverCommunities = () => {
    const navigate = useNavigate();

    const [communities, setCommunities] = useState([]);
    const [studentInterests, setStudentInterests] = useState([]);
    const [requiresInterests, setRequiresInterests] = useState(false);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState(null);

    // Filters & Search
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        try {
            setLoading(true);
            const data = await apiFetch("/community/discover");
            setCommunities(data.communities || []);
            setStudentInterests(data.studentInterests || []);
            setRequiresInterests(data.requiresInterests || false);
        } catch (error) {
            console.error("Error discovering communities:", error);
            alert(error.message || "Failed to load communities.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCommunity = async (community) => {
        let password = "";

        if (community.visibility === "private") {
            password = window.prompt("Enter password for private community:");
            if (password === null) return;
            if (!password.trim()) {
                alert("Password is required to join this private community.");
                return;
            }
        }

        try {
            setJoiningId(community._id);
            const data = await apiFetch("/community/join", {
                method: "POST",
                body: JSON.stringify({
                    communityId: community._id,
                    communityCode: community.communityCode,
                    password
                })
            });

            alert(data.message || `Successfully joined ${community.name}!`);
            loadCommunities();
        } catch (error) {
            console.error("Error joining community:", error);
            alert(error.message || "Failed to join community.");
        } finally {
            setJoiningId(null);
        }
    };

    // Filter & Search Logic
    const filteredCommunities = communities
        .filter((community) => {
            const matchesSearch =
                community.name.toLowerCase().includes(search.toLowerCase()) ||
                (community.description || "").toLowerCase().includes(search.toLowerCase()) ||
                (community.ownerName || "").toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                categoryFilter === "all" ||
                community.category?.toLowerCase() === categoryFilter.toLowerCase();

            const matchesVisibility =
                visibilityFilter === "all" ||
                community.visibility === visibilityFilter;

            return matchesSearch && matchesCategory && matchesVisibility;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "members":
                    return (b.totalMembers || 0) - (a.totalMembers || 0);
                case "quizzes":
                    return (b.totalQuizzes || 0) - (a.totalQuizzes || 0);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
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
                            👥 Interest-Based Community Discovery
                        </span>
                        <h1 style={{ marginTop: "8px" }}>👥 Discover Communities</h1>
                        <p style={{ color: "var(--muted)", marginTop: "4px" }}>
                            Explore and join learning communities matching your selected interests.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate("/aspirant/my-communities")}
                            style={{ padding: "10px 18px" }}
                        >
                            👥 My Joined Communities
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate("/aspirant/select-interests")}
                            style={{ padding: "10px 18px" }}
                        >
                            ⚙️ Manage Interests ({studentInterests.length})
                        </button>
                    </div>
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
                            🎯 Filtered by Your Interests:
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
                                    padding: "4px 12px",
                                    borderRadius: "999px",
                                    fontSize: "0.82rem",
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
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: "12px",
                    marginBottom: "30px",
                    background: "var(--surface-soft)",
                    padding: "16px",
                    borderRadius: "18px",
                    border: "1px solid var(--border)"
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Search communities by name or owner..."
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
                        <option value="all">All Matching Interests</option>
                        {studentInterests.map((cat, idx) => (
                            <option key={idx} value={cat}>
                                {getCategoryIcon(cat)} {cat}
                            </option>
                        ))}
                    </select>

                    <select
                        value={visibilityFilter}
                        onChange={(e) => setVisibilityFilter(e.target.value)}
                        style={{
                            width: "100%",
                            border: "1px solid var(--border)",
                            borderRadius: "18px",
                            padding: "14px 16px",
                            background: "var(--surface)",
                            font: "inherit"
                        }}
                    >
                        <option value="all">All Visibility</option>
                        <option value="public">🌍 Public Only</option>
                        <option value="private">🔒 Private Only</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            width: "100%",
                            border: "1px solid var(--border)",
                            borderRadius: "18px",
                            padding: "14px 16px",
                            background: "var(--surface)",
                            font: "inherit"
                        }}
                    >
                        <option value="newest">Newest First</option>
                        <option value="members">Most Members</option>
                        <option value="quizzes">Most Quizzes</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <h2>Discovering relevant communities...</h2>
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
                        <h2>No interests selected.</h2>
                        <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "10px auto 25px" }}>
                            Select your interests to discover relevant communities and connect with mentors and peers.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/aspirant/select-interests")}
                        >
                            Select Interests
                        </button>
                    </div>
                ) : filteredCommunities.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "50px 20px",
                        background: "var(--surface-soft)",
                        borderRadius: "20px",
                        border: "1.5px dashed var(--border)"
                    }}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>👥</span>
                        <h2>No communities found for your selected interests.</h2>
                        <p style={{ color: "var(--muted)", margin: "8px 0 20px" }}>
                            {search || categoryFilter !== "all" || visibilityFilter !== "all"
                                ? "No communities match your current search and filters."
                                : `No communities are currently active in categories matching your interests (${studentInterests.join(", ")}).`}
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            {(search || categoryFilter !== "all" || visibilityFilter !== "all") && (
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setSearch("");
                                        setCategoryFilter("all");
                                        setVisibilityFilter("all");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/aspirant/select-interests")}
                            >
                                ⚙️ Adjust Interests
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                        gap: "24px"
                    }}>
                        {filteredCommunities.map((community) => {
                            const icon = getCategoryIcon(community.category);
                            const isJoined = community.isJoined;

                            return (
                                <div
                                    key={community._id}
                                    className="control-card"
                                    style={{
                                        border: "1.5px solid var(--border)",
                                        borderRadius: "20px",
                                        padding: "24px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        background: "var(--surface)",
                                        boxShadow: "0 6px 18px rgba(17, 33, 71, 0.05)"
                                    }}
                                >
                                    <div>
                                        {/* Category Badge & Visibility */}
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
                                                {icon} {community.category || "General"}
                                            </span>

                                            <span style={{
                                                padding: "4px 10px",
                                                borderRadius: "8px",
                                                fontSize: "0.75rem",
                                                fontWeight: "700",
                                                background: community.visibility === "public" ? "rgba(34, 197, 94, 0.12)" : "rgba(255, 123, 82, 0.12)",
                                                color: community.visibility === "public" ? "#16a34a" : "#ff7b52"
                                            }}>
                                                {community.visibility === "public" ? "🌍 Public" : "🔒 Private"}
                                            </span>
                                        </div>

                                        <h2 style={{ margin: "0 0 8px", fontSize: "1.3rem" }}>{community.name}</h2>
                                        <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0 0 16px", lineHeight: "1.5" }}>
                                            {community.description || "No description provided."}
                                        </p>

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
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>OWNER</span>
                                                <strong>👨‍🏫 {community.ownerName}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>CODE</span>
                                                <strong>🔑 {community.communityCode}</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>MEMBERS</span>
                                                <strong>👥 {community.totalMembers || 0} Members</strong>
                                            </div>
                                            <div>
                                                <span style={{ color: "var(--muted)", display: "block", fontSize: "0.75rem" }}>QUIZZES</span>
                                                <strong>📝 {community.totalQuizzes || 0} Quizzes</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ flex: 1, padding: "10px 12px", fontSize: "0.88rem" }}
                                            onClick={() => navigate(`/aspirant/community/${community._id}`)}
                                        >
                                            View Community
                                        </button>

                                        {isJoined ? (
                                            <span
                                                style={{
                                                    flex: 1,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    background: "rgba(34, 197, 94, 0.15)",
                                                    color: "#16a34a",
                                                    fontWeight: "700",
                                                    borderRadius: "14px",
                                                    fontSize: "0.88rem",
                                                    padding: "10px 12px"
                                                }}
                                            >
                                                ✓ Joined
                                            </span>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                style={{ flex: 1, padding: "10px 12px", fontSize: "0.88rem" }}
                                                disabled={joiningId === community._id}
                                                onClick={() => handleJoinCommunity(community)}
                                            >
                                                {joiningId === community._id ? "Joining..." : "Join Community"}
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

export default DiscoverCommunities;
