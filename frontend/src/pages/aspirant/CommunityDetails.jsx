import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import StudentCommunityQuizCard from "../../components/community/StudentCommunityQuizCard.jsx";
import { getCategoryIcon } from "../../utils/categories.js";

const CommunityDetails = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [myMembership, setMyMembership] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCommunityData();
    }, [communityId]);

    const loadCommunityData = async () => {
        try {
            setLoading(true);
            setError("");

            // 1. Fetch community details & membership status
            const detailsData = await apiFetch(`/community/${communityId}`);
            setCommunity(detailsData.community);
            setMyMembership(detailsData.myMembership);
            setStatistics(detailsData.statistics);

            // 2. If member, fetch community quizzes
            if (detailsData.myMembership) {
                try {
                    const quizData = await apiFetch(`/community/${communityId}/quizzes`);
                    if (quizData.success) {
                        setQuizzes(quizData.quizzes || []);
                    }
                } catch (quizErr) {
                    console.log("Not authorized to load quizzes or error:", quizErr);
                    setQuizzes([]);
                }
            } else {
                setQuizzes([]);
            }
        } catch (err) {
            console.error("Error loading community details:", err);
            setError(err.message || "Failed to load community details.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCommunity = async () => {
        if (!community) return;

        let password = "";
        if (community.visibility === "private") {
            password = window.prompt("Enter password for this private community:");
            if (password === null) return;
            if (!password.trim()) {
                alert("Password is required for private community.");
                return;
            }
        }

        try {
            setJoining(true);
            const data = await apiFetch("/community/join", {
                method: "POST",
                body: JSON.stringify({
                    communityId: community._id,
                    communityCode: community.communityCode,
                    password
                })
            });

            alert(data.message || "Successfully joined community!");
            loadCommunityData();
        } catch (err) {
            console.error("Join community error:", err);
            alert(err.message || "Failed to join community.");
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <main className="page-shell" style={{ padding: "30px 0 60px" }}>
                <section className="card-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <h2>Loading community details...</h2>
                </section>
            </main>
        );
    }

    if (error || !community) {
        return (
            <main className="page-shell" style={{ padding: "30px 0 60px" }}>
                <section className="card-panel" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <h2>Community Not Found</h2>
                    <p style={{ color: "var(--muted)", margin: "10px 0 20px" }}>{error || "The requested community could not be loaded."}</p>
                    <button className="btn btn-outline" onClick={() => navigate("/aspirant/discover-communities")}>
                        ← Back to Discover Communities
                    </button>
                </section>
            </main>
        );
    }

    const icon = getCategoryIcon(community.category);
    const isMember = Boolean(myMembership);

    return (
        <main className="page-shell" style={{ padding: "30px 0 60px" }}>
            <section className="card-panel">
                {/* Back Button */}
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate(-1)}
                    style={{ marginBottom: "16px", padding: "8px 14px", fontSize: "0.85rem" }}
                >
                    ← Back
                </button>

                {/* Community Header Banner */}
                <div style={{
                    background: "var(--surface-soft)",
                    borderRadius: "24px",
                    padding: "30px",
                    border: "1.5px solid var(--border)",
                    marginBottom: "30px"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", marginBottom: "15px" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "10px" }}>
                                <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: "var(--primary-soft)",
                                    color: "var(--primary)",
                                    padding: "5px 12px",
                                    borderRadius: "999px",
                                    fontSize: "0.85rem",
                                    fontWeight: "700"
                                }}>
                                    {icon} {community.category || "General"}
                                </span>

                                <span style={{
                                    padding: "5px 12px",
                                    borderRadius: "8px",
                                    fontSize: "0.8rem",
                                    fontWeight: "700",
                                    background: community.visibility === "public" ? "rgba(34, 197, 94, 0.12)" : "rgba(255, 123, 82, 0.12)",
                                    color: community.visibility === "public" ? "#16a34a" : "#ff7b52"
                                }}>
                                    {community.visibility === "public" ? "🌍 Public Community" : "🔒 Private Community"}
                                </span>

                                {isMember && (
                                    <span style={{
                                        padding: "5px 12px",
                                        borderRadius: "999px",
                                        fontSize: "0.8rem",
                                        fontWeight: "700",
                                        background: "rgba(34, 197, 94, 0.15)",
                                        color: "#16a34a"
                                    }}>
                                        ✓ Joined (Member)
                                    </span>
                                )}
                            </div>

                            <h1 style={{ margin: "0 0 10px", fontSize: "2rem" }}>👥 {community.name}</h1>
                            <p style={{ color: "var(--muted)", maxWidth: "700px", lineHeight: "1.6", margin: 0 }}>
                                {community.description || "No description provided for this community."}
                            </p>
                        </div>

                        {/* Join / Status Action */}
                        <div>
                            {isMember ? (
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate("/aspirant/community-quizzes")}
                                    style={{ padding: "12px 20px", fontWeight: "700" }}
                                >
                                    📝 View All Community Quizzes
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    disabled={joining}
                                    onClick={handleJoinCommunity}
                                    style={{ padding: "12px 24px", fontWeight: "700", fontSize: "1rem" }}
                                >
                                    {joining ? "Joining..." : "Join Community"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "14px",
                        marginTop: "24px",
                        paddingTop: "20px",
                        borderTop: "1px solid var(--border)"
                    }}>
                        <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>COMMUNITY OWNER</span>
                            <h4 style={{ margin: "4px 0 0", fontSize: "1rem" }}>👨‍🏫 {community.ownerName}</h4>
                        </div>

                        <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>COMMUNITY CODE</span>
                            <h4 style={{ margin: "4px 0 0", fontSize: "1rem", letterSpacing: "1px" }}>🔑 {community.communityCode}</h4>
                        </div>

                        <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>TOTAL MEMBERS</span>
                            <h4 style={{ margin: "4px 0 0", fontSize: "1rem" }}>👥 {community.totalMembers || statistics?.totalMembers || 0}</h4>
                        </div>

                        <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: "700", textTransform: "uppercase" }}>PUBLISHED QUIZZES</span>
                            <h4 style={{ margin: "4px 0 0", fontSize: "1rem" }}>📝 {statistics?.publishedQuizzes || community.totalQuizzes || 0}</h4>
                        </div>
                    </div>
                </div>

                {/* Published Community Quizzes Section */}
                <div style={{ marginTop: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "1.4rem" }}>📝 Published Community Quizzes</h2>
                            <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: "0.9rem" }}>
                                All published tests and assessments created for members of this community.
                            </p>
                        </div>
                    </div>

                    {!isMember ? (
                        /* Not a Member Banner */
                        <div style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            background: "var(--surface-soft)",
                            borderRadius: "20px",
                            border: "1.5px dashed var(--border)"
                        }}>
                            <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>🔒</span>
                            <h2>Community Quizzes are Locked</h2>
                            <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "8px auto 20px" }}>
                                You must join this community to unlock and attempt its published quizzes and exams.
                            </p>
                            <button
                                className="btn btn-primary"
                                disabled={joining}
                                onClick={handleJoinCommunity}
                            >
                                {joining ? "Joining..." : "Join Community to Unlock Quizzes"}
                            </button>
                        </div>
                    ) : quizzes.length === 0 ? (
                        /* Joined but No Quizzes */
                        <div style={{
                            textAlign: "center",
                            padding: "50px 20px",
                            background: "var(--surface-soft)",
                            borderRadius: "20px",
                            border: "1.5px dashed var(--border)"
                        }}>
                            <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>📝</span>
                            <h2>No published quizzes are currently available in this community.</h2>
                            <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "8px auto 20px" }}>
                                The community owner or examiners haven't published any quizzes yet. Check back soon!
                            </p>
                            <button
                                className="btn btn-outline"
                                onClick={() => navigate("/aspirant/community-quizzes")}
                            >
                                Browse Other Joined Community Quizzes
                            </button>
                        </div>
                    ) : (
                        /* List of Quizzes */
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "24px"
                        }}>
                            {quizzes.map((quiz) => (
                                <StudentCommunityQuizCard
                                    key={quiz._id}
                                    quiz={{
                                        ...quiz,
                                        communityName: community.name
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default CommunityDetails;
