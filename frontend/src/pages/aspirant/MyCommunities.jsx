import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import { getCategoryIcon } from "../../utils/categories.js";

const MyCommunities = () => {
    const navigate = useNavigate();

    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        loadMyCommunities();
    }, []);

    const loadMyCommunities = async () => {
        try {
            setLoading(true);
            const data = await apiFetch("/community/my");
            setCommunities(data.communities || []);
        } catch (error) {
            console.error("Error loading joined communities:", error);
            alert(error.message || "Failed to load communities.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCommunities = communities.filter((community) => {
        const matchesSearch =
            community.name.toLowerCase().includes(search.toLowerCase()) ||
            (community.description || "").toLowerCase().includes(search.toLowerCase()) ||
            (community.ownerName || "").toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            categoryFilter === "all" ||
            community.category?.toLowerCase() === categoryFilter.toLowerCase();

        return matchesSearch && matchesCategory;
    });

    const categoriesInList = Array.from(
        new Set(communities.map((c) => c.category).filter(Boolean))
    );

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
                            👥 Joined Learning Communities
                        </span>
                        <h1 style={{ marginTop: "8px" }}>👥 My Communities</h1>
                        <p style={{ color: "var(--muted)", marginTop: "4px" }}>
                            Communities you have joined. You have full access to all quizzes published within these communities.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/aspirant/discover-communities")}
                            style={{ padding: "10px 18px" }}
                        >
                            🌍 Discover Communities
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={() => navigate("/aspirant/community-quizzes")}
                            style={{ padding: "10px 18px" }}
                        >
                            📝 Community Quizzes
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
                            {communities.length}
                        </h2>
                    </div>

                    <div className="control-card" style={{ padding: "16px 20px", background: "var(--surface-soft)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>
                            Total Quizzes Available
                        </span>
                        <h2 style={{ margin: "6px 0 0", color: "#16a34a", fontSize: "1.8rem" }}>
                            {communities.reduce((sum, c) => sum + (c.totalQuizzes || 0), 0)}
                        </h2>
                    </div>

                    <div className="control-card" style={{ padding: "16px 20px", background: "var(--surface-soft)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>
                            Matching Search
                        </span>
                        <h2 style={{ margin: "6px 0 0", color: "var(--text)", fontSize: "1.8rem" }}>
                            {filteredCommunities.length}
                        </h2>
                    </div>
                </div>

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
                        placeholder="🔍 Search joined communities..."
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
                        <option value="all">All Categories ({categoriesInList.length})</option>
                        {categoriesInList.map((cat, idx) => (
                            <option key={idx} value={cat}>
                                {getCategoryIcon(cat)} {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                        <h2>Loading your communities...</h2>
                    </div>
                ) : communities.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        background: "var(--surface-soft)",
                        borderRadius: "20px",
                        border: "1.5px dashed var(--border)"
                    }}>
                        <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "15px" }}>👥</span>
                        <h2>You haven't joined any communities yet.</h2>
                        <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "10px auto 25px" }}>
                            Explore communities matching your selected interests and join to participate in exclusive group quizzes and collaborate.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/aspirant/discover-communities")}
                        >
                            🌍 Discover Communities Now
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
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>🔍</span>
                        <h2>No communities found matching your search.</h2>
                        <p style={{ color: "var(--muted)", margin: "8px 0 20px" }}>
                            Try adjusting your search terms or category filter.
                        </p>
                        <button
                            className="btn btn-outline"
                            onClick={() => {
                                setSearch("");
                                setCategoryFilter("all");
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                        gap: "24px"
                    }}>
                        {filteredCommunities.map((community) => {
                            const icon = getCategoryIcon(community.category);

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
                                        {/* Category Badge & Status */}
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
                                                background: "rgba(34, 197, 94, 0.12)",
                                                color: "#16a34a"
                                            }}>
                                                ✓ Joined
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
                                            View Details
                                        </button>

                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, padding: "10px 12px", fontSize: "0.88rem" }}
                                            onClick={() => navigate("/aspirant/community-quizzes")}
                                        >
                                            📝 Quizzes
                                        </button>
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

export default MyCommunities;
