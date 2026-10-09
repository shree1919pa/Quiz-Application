const PerformanceStats = ({ statistics }) => {

    if (!statistics) return null;

    const cards = [

        {
            title: "Total Quizzes",
            value: statistics.totalQuiz,
            color: "#2858dd"
        },

        {
            title: "Highest Score",
            value: `${statistics.highestScore}%`,
            color: "#16a34a"
        },

        {
            title: "Average Score",
            value: `${statistics.averageScore}%`,
            color: "#f59e0b"
        },

        {
            title: "Passed",
            value: statistics.passed,
            color: "#22c55e"
        },

        {
            title: "Failed",
            value: statistics.failed,
            color: "#ef4444"
        }

    ];

    return (

        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "20px",
                marginBottom: "30px"
            }}
        >

            {

                cards.map((card, index) => (

                    <div
                        key={index}
                        className="control-card"
                        style={{
                            textAlign: "center",
                            padding: "25px"
                        }}
                    >

                        <h3
                            style={{
                                marginBottom: "15px",
                                color: "#555"
                            }}
                        >
                            {card.title}
                        </h3>

                        <h1
                            style={{
                                color: card.color,
                                fontSize: "36px",
                                margin: 0
                            }}
                        >
                            {card.value}
                        </h1>

                    </div>

                ))

            }

        </div>

    );

};

export default PerformanceStats;