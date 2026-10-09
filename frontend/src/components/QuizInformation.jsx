const QuizInformation = ({ quiz }) => {

    if (!quiz) return null;

    return (

        <div
            style={{
                background: "#f8f9fa",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "25px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}
        >

            <h2
                style={{
                    marginBottom: "20px",
                    color: "#2858dd"
                }}
            >
                Quiz Information
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                    gap: "15px"
                }}
            >

                <InfoCard
                    title="Quiz Name"
                    value={quiz.title}
                />

                <InfoCard
                    title="Status"
                    value={
                        quiz.isPublished
                            ? "Published"
                            : "Draft"
                    }
                />

                <InfoCard
                    title="Quiz Type"
                    value={
                        quiz.isPrivate
                            ? "Private"
                            : "Public"
                    }
                />

                <InfoCard
                    title="Time Limit"
                    value={`${quiz.timeLimit} Minutes`}
                />

                <InfoCard
                    title="Quiz Code"
                    value={
                        quiz.quizCode || "-"
                    }
                />

                <InfoCard
                    title="Attempts"
                    value={
                        quiz.oneAttemptOnly
                            ? "One Attempt"
                            : "Multiple Attempts"
                    }
                />

                <InfoCard
                    title="Created"
                    value={
                        new Date(
                            quiz.createdAt
                        ).toLocaleDateString()
                    }
                />

                <InfoCard
                    title="Updated"
                    value={
                        new Date(
                            quiz.updatedAt
                        ).toLocaleDateString()
                    }
                />

            </div>

        </div>

    );

};

const InfoCard = ({ title, value }) => {

    return (

        <div
            style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px"
            }}
        >

            <h4
                style={{
                    marginBottom: "8px",
                    color: "#666",
                    fontSize: "14px"
                }}
            >
                {title}
            </h4>

            <h3
                style={{
                    margin: 0,
                    color: "#222"
                }}
            >
                {value}
            </h3>

        </div>

    );

};

export default QuizInformation;