import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

const CommunityCard = ({
    community,
    refreshCommunities
}) => {

    const navigate = useNavigate();

    const openCommunity = () => {

        navigate(`/examiner/quiz-communities/${community._id}`);

    };

    const deleteCommunity = async () => {

        const confirmDelete = window.confirm(

            `Delete "${community.name}" community?`

        );

        if (!confirmDelete) return;

        try {

            await apiFetch(

                `/community/${community._id}`,

                {
                    method: "DELETE"
                }

            );

            alert("Community deleted successfully.");

            refreshCommunities();

        }

        catch (error) {

            console.log(error);

            alert(error.message);

        }

    };

    return (

        <div
            className="control-card"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
            }}
        >

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >

                <h2
                    style={{
                        margin: 0
                    }}
                >
                    {community.name}
                </h2>

                <span
                    style={{
                        background:
                            community.visibility === "public"

                                ? "#d4edda"

                                : "#f8d7da",

                        color:
                            community.visibility === "public"

                                ? "#155724"

                                : "#721c24",

                        padding: "4px 10px",

                        borderRadius: "20px",

                        fontSize: "13px",

                        fontWeight: "bold"
                    }}
                >

                    {

                        community.visibility === "public"

                            ? "🌍 Public"

                            : "🔒 Private"

                    }

                </span>

            </div>

            <p>

                <strong>Description:</strong>

                {" "}

                {

                    community.description ||

                    "No description"

                }

            </p>

            <p>

                <strong>Category:</strong>

                {" "}

                {community.category}

            </p>

            <p>

                <strong>Community Code:</strong>

                {" "}

                {community.communityCode}

            </p>

            <p>

                <strong>Owner:</strong>

                {" "}

                {community.ownerName}

            </p>

            <hr />

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >

                <div>

                    👥 Members

                    <br />

                    <strong>

                        {community.totalMembers}

                    </strong>

                </div>

                <div>

                    📝 Quizzes

                    <br />

                    <strong>

                        {community.totalQuizzes}

                    </strong>

                </div>

            </div>

            <hr />

            <div
                style={{
                    display: "flex",
                    gap: "10px"
                }}
            >

                <button
                    className="btn btn-primary"
                    onClick={openCommunity}
                >

                    Open

                </button>

                <button
                    className="btn btn-danger"
                    onClick={deleteCommunity}
                >

                    Delete

                </button>

            </div>

        </div>

    );

};

export default CommunityCard;