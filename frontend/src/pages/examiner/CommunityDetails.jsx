import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import CommunityQuizCard from "../../components/community/CommunityQuizCard";
import CommunityStats from "../../components/community/CommunityStats";
import EditCommunityModal from "../../components/community/EditCommunityModal";


const CommunityDetails = () => {

    const { communityId } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);

    const [myMembership, setMyMembership] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    const [quizzes, setQuizzes] = useState([]);
    const [openEditModal, setOpenEditModal] = useState(false);


    useEffect(() => {

        loadCommunity();

    }, []);
    const loadCommunity = async () => {

        try {

            setLoading(true);

            // Load Community Details
            const data = await apiFetch(
                `/community/${communityId}`
            );

            setCommunity(data.community);
            setMembers(data.members);
            setStatistics(data.statistics);
            setMyMembership(data.myMembership);

            // Load Community Quizzes
            const quizData = await apiFetch(
                `/community/${communityId}/quizzes`
            );

            console.log("Community Quiz API:", quizData);

            if (quizData.success) {

                setQuizzes(quizData.quizzes || []);
                console.log("Quiz API Response:", quizData);//change
                console.log("Quiz State:", quizData.quizzes);//change

            } else {

                setQuizzes([]);

            }

        }

        catch (error) {

            console.log(error);

            alert(error.message);

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <main className="page-shell">

                <section className="card-panel">

                    <h2>Loading Community...</h2>

                </section>

            </main>

        );

    }

    if (!community) {

        return (

            <main className="page-shell">

                <section className="card-panel">

                    <h2>Community Not Found</h2>

                </section>

            </main>

        );

    }

    return (

        <main className="page-shell">

            <section className="card-panel">

                <button
                    className="btn btn-outline"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <br />
                <br />

                <h1>{community.name}</h1>

                <p>{community.description}</p>

                <hr />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap"
                    }}
                >

                    <div>

                        <div>

                            <span className="eyebrow">

                                Community Analytics

                            </span>

                            <h2>

                                📊 Community Dashboard

                            </h2>

                            <p>

                                Overview of quizzes, members and activity.

                            </p>

                        </div>

                    </div>

                </div>

                <br />

                <CommunityStats

                    statistics={statistics}

                />

                <hr />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(220px,1fr))",
                        gap: "20px"
                    }}
                >

                    <div className="control-card">

                        <h3>Category</h3>

                        <p>{community.category}</p>

                    </div>

                    <div className="control-card">

                        <h3>Visibility</h3>

                        <p>

                            {

                                community.visibility === "public"

                                    ? "🌍 Public"

                                    : "🔒 Private"

                            }

                        </p>

                    </div>

                    <div className="control-card">

                        <h3>Community Code</h3>

                        <p>{community.communityCode}</p>

                    </div>

                    <div className="control-card">

                        <h3>Owner</h3>

                        <p>{community.ownerName}</p>

                    </div>

                    <div className="control-card">

                        <h3>Members</h3>

                        <p>{community.totalMembers}</p>

                    </div>

                    <div className="control-card">

                        <h3>Quizzes</h3>

                        <p>{community.totalQuizzes}</p>

                    </div>

                </div>

                <br />

                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        flexWrap: "wrap"
                    }}
                >

                    {

                        !myMembership ? (

                            <button
                                className="btn btn-primary"
                            >
                                Join Community
                            </button>

                        ) : (

                            <>
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(
                                            `/examiner/create-quiz?communityId=${community._id}`
                                        )
                                    }
                                >
                                    ➕ Add Quiz
                                </button>

                                <button
                                    className="btn btn-outline"
                                    onClick={() =>
                                        navigate(
                                            `/examiner/community/${community._id}/members`
                                        )
                                    }
                                >

                                    👥 View Members

                                </button>

                                {

                                    myMembership.role === "owner"

                                        ?

                                        <>

                                            <button
                                                className="btn btn-warning"
                                                onClick={() =>
                                                    setOpenEditModal(true)
                                                }
                                            >
                                                ✏️ Edit Community
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                            >
                                                🗑 Delete Community
                                            </button>

                                        </>

                                        :

                                        <button
                                            className="btn btn-secondary"
                                        >
                                            🚪 Leave Community
                                        </button>

                                }
                            </>

                        )

                    }

                </div>

                <br />

                <h2>Community Members</h2>

                <hr />

                {

                    members.length === 0

                        ?

                        (

                            <p>No Members Found.</p>

                        )

                        :

                        (

                            members.map((member) => (

                                <div

                                    key={member._id}

                                    className="control-card"

                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "15px"
                                    }}

                                >

                                    <strong>

                                        {member.examinerName}

                                    </strong>

                                    <span
                                        style={{
                                            padding: "5px 12px",
                                            borderRadius: "20px",
                                            background:

                                                member.role === "owner"

                                                    ? "#d4edda"

                                                    : "#e3f2fd",

                                            color:

                                                member.role === "owner"

                                                    ? "green"

                                                    : "#1565c0",

                                            fontWeight: "bold"
                                        }}
                                    >

                                        {

                                            member.role === "owner"

                                                ? "Owner"

                                                : "Contributor"

                                        }

                                    </span>

                                </div>

                            ))

                        )

                }



                <br />

                <h2>

                    Community Quizzes

                </h2>

                <hr />

                {

                    quizzes.length === 0

                        ?

                        (

                            <p>

                                <div
                                    className="control-card"
                                    style={{
                                        textAlign: "center",
                                        padding: "40px"
                                    }}
                                >

                                    <h3>

                                        No Quizzes Yet

                                    </h3>

                                    <p>

                                        Be the first examiner to add a quiz to this community.

                                    </p>

                                </div>

                            </p>

                        )

                        :

                        (

                            quizzes.map((quiz) => (

                                <CommunityQuizCard

                                    key={quiz._id}

                                    quiz={quiz}

                                />

                            ))

                        )


                }
            </section>

            <EditCommunityModal

                open={openEditModal}

                onClose={() =>
                    setOpenEditModal(false)
                }

                community={community}

                onSuccess={() => {

                    loadCommunity();

                }}

            />

        </main>

    );

};

export default CommunityDetails;