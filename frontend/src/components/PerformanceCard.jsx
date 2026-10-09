import { useNavigate } from "react-router-dom";

const PerformanceCard = ({ item }) => {

    const navigate = useNavigate();

    const openDetails = () => {

        navigate(`/aspirant/performance/${item._id}`);

    };

    return (

        <div
            className="control-card"
            style={{
                marginBottom: "20px",
                padding: "25px"
            }}
        >

            {/* Header */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px"
                }}
            >

                <div>

                    <h2
                        style={{
                            margin: 0
                        }}
                    >
                        {item.title}
                    </h2>

                    <p
                        style={{
                            color: "#666",
                            marginTop: "6px"
                        }}
                    >
                        Quiz Code :
                        {" "}
                        <strong>{item.quizCode}</strong>
                    </p>

                </div>

                <div>

                    <span
                        style={{
                            padding: "8px 18px",
                            borderRadius: "20px",
                            fontWeight: "bold",
                            color: "#fff",
                            background:
                                item.result === "PASS"
                                    ? "#16a34a"
                                    : "#dc2626"
                        }}
                    >
                        {item.result}
                    </span>

                </div>

            </div>

            <hr
                style={{
                    margin: "20px 0"
                }}
            />

            {/* Details */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
                    gap: "20px"
                }}
            >

                <div>

                    <h4>Score</h4>

                    <p>

                        {item.score} / {item.totalMarks}

                    </p>

                </div>

                <div>

                    <h4>Percentage</h4>

                    <p
                        style={{
                            color: "#2858dd",
                            fontWeight: "bold"
                        }}
                    >
                        {item.percentage}%
                    </p>

                </div>

                <div>

                    <h4>Date</h4>

                    <p>

                        {

                            new Date(item.createdAt)

                                .toLocaleDateString()

                        }

                    </p>

                </div>

                <div>

                    <h4>Time</h4>

                    <p>

                        {

                            new Date(item.createdAt)

                                .toLocaleTimeString()

                        }

                    </p>

                </div>

            </div>

            <br />

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end"
                }}
            >

                <button
                    className="btn btn-primary"
                    onClick={openDetails}
                >
                    View Details
                </button>

            </div>

        </div>

    );

};

export default PerformanceCard;