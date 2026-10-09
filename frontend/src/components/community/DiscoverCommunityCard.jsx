import { useState } from "react";
import { apiFetch } from "../../services/api";

const DiscoverCommunityCard = ({ community, refresh }) => {

    const [loading, setLoading] = useState(false);

    const joinCommunity = async () => {

        let password = "";

        if (community.visibility === "private") {

            password = window.prompt(
                "Enter Community Password"
            );

            if (password === null) return;

        }

        try {

            setLoading(true);

            const data = await apiFetch(

                "/community/join",

                {
                    method: "POST",

                    body: JSON.stringify({

                        communityCode: community.communityCode,

                        password

                    })

                }

            );

            alert(data.message);

            refresh();

        }

        catch (error) {

            console.log(error);

            alert(error.message);

        }

        finally {

            setLoading(false);

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

            {/* Header */}

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
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        background:

                            community.visibility === "public"

                                ? "#d4edda"

                                : "#f8d7da",

                        color:

                            community.visibility === "public"

                                ? "#155724"

                                : "#721c24"

                    }}
                >

                    {

                        community.visibility === "public"

                            ? "🌍 Public"

                            : "🔒 Private"

                    }

                </span>

            </div>

            {/* Description */}

            <p>

                {

                    community.description ||

                    "No description available."

                }

            </p>

            <hr />

            <p>

                <strong>Category :</strong>{" "}

                {community.category}

            </p>

            <p>

                <strong>Owner :</strong>{" "}

                {community.ownerName}

            </p>

            <p>

                <strong>Community Code :</strong>{" "}

                {community.communityCode}

            </p>

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

            <button
                className="btn btn-primary"
                disabled={loading}
                onClick={joinCommunity}
            >

                {

                    loading

                        ? "Joining..."

                        : "Join Community"

                }

            </button>

        </div>

    );

};

export default DiscoverCommunityCard;