const CommunityStats = ({ communities, statistics }) => {
    // If statistics object is provided (e.g. on CommunityDetails page)
    if (statistics) {
        const statCards = [
            {
                title: "Total Quizzes",
                value: statistics.totalQuizzes ?? 0,
                icon: "📝",
                color: "#2563eb",
                background: "#eff6ff"
            },
            {
                title: "Members",
                value: statistics.totalMembers ?? 0,
                icon: "👥",
                color: "#9333ea",
                background: "#faf5ff"
            },
            {
                title: "Attempts",
                value: statistics.totalAttempts ?? 0,
                icon: "📊",
                color: "#0284c7",
                background: "#f0f9ff"
            },
            {
                title: "Published",
                value: statistics.publishedQuizzes ?? 0,
                icon: "🟢",
                color: "#16a34a",
                background: "#f0fdf4"
            },
            {
                title: "Draft",
                value: statistics.draftQuizzes ?? 0,
                icon: "🟡",
                color: "#ca8a04",
                background: "#fefce8"
            },
            {
                title: "Average Score",
                value: `${statistics.averageScore ?? 0}%`,
                icon: "🏆",
                color: "#ea580c",
                background: "#fff7ed"
            }
        ];

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "18px",
                    marginBottom: "25px"
                }}
            >
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className="control-card"
                        style={{
                            background: card.background,
                            border: `1px solid ${card.color}30`,
                            borderRadius: "14px",
                            padding: "20px",
                            textAlign: "center",
                            transition: "0.3s",
                            boxShadow: "0 4px 12px rgba(0,0,0,.05)",
                            cursor: "default"
                        }}
                    >
                        <div style={{ fontSize: "36px", marginBottom: "10px" }}>
                            {card.icon}
                        </div>
                        <h2 style={{ margin: "5px 0", color: card.color }}>
                            {card.value}
                        </h2>
                        <p style={{ color: "#555", fontWeight: "600", margin: 0 }}>
                            {card.title}
                        </p>
                    </div>
                ))}
            </div>
        );
    }

    // If communities list is provided (e.g. on QuizCommunities page)
    if (communities) {
        const totalCommunities = communities.length;
        const publicCommunities = communities.filter(
            (community) => community.visibility === "public"
        ).length;
        const privateCommunities = communities.filter(
            (community) => community.visibility === "private"
        ).length;
        const totalMembers = communities.reduce(
            (sum, community) => sum + (community.totalMembers || 0),
            0
        );
        const totalQuizzes = communities.reduce(
            (sum, community) => sum + (community.totalQuizzes || 0),
            0
        );

        const cards = [
            {
                title: "Communities",
                value: totalCommunities,
                icon: "🏘️",
                color: "#2563eb",
                background: "#eff6ff"
            },
            {
                title: "Public",
                value: publicCommunities,
                icon: "🌍",
                color: "#16a34a",
                background: "#f0fdf4"
            },
            {
                title: "Private",
                value: privateCommunities,
                icon: "🔒",
                color: "#ca8a04",
                background: "#fefce8"
            },
            {
                title: "Members",
                value: totalMembers,
                icon: "👥",
                color: "#9333ea",
                background: "#faf5ff"
            },
            {
                title: "Quizzes",
                value: totalQuizzes,
                icon: "📝",
                color: "#ea580c",
                background: "#fff7ed"
            }
        ];

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px"
                }}
            >
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="control-card"
                        style={{
                            background: card.background,
                            border: `1px solid ${card.color}30`,
                            borderRadius: "14px",
                            padding: "22px",
                            textAlign: "center",
                            transition: "0.3s",
                            boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                            cursor: "default"
                        }}
                    >
                        <div style={{ fontSize: "38px", marginBottom: "12px" }}>
                            {card.icon}
                        </div>
                        <h1 style={{ margin: "0", color: card.color, fontSize: "2rem" }}>
                            {card.value}
                        </h1>
                        <p style={{ marginTop: "8px", fontWeight: "600", color: "#555", margin: 0 }}>
                            {card.title}
                        </p>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default CommunityStats;