import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

// Components
import CommunityCard from "../../components/community/CommunityCard";
import CreateCommunityModal from "../../components/community/CreateCommunityModal";
import CommunityStats from "../../components/community/CommunityStats";
import CommunityFilters from "../../components/community/CommunityFilters";

import JoinCommunityModal from "../../components/community/JoinCommunityModal";

const QuizCommunities = () => {

    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [visibility, setVisibility] = useState("all");
    const [joinModal, setJoinModal] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {

        try {

            const data = await apiFetch("/community/my");

            setCommunities(data.communities);

        } catch (error) {

            console.log(error);
            alert(error.message);

        } finally {

            setLoading(false);

        }

    };

    // ===========================
    // Filter Communities
    // ===========================

    const filteredCommunities = communities.filter((community) => {

        const searchMatch =
            community.name
                .toLowerCase()
                .includes(search.toLowerCase());

        const categoryMatch =
            category === "all" ||
            community.category === category;

        const visibilityMatch =
            visibility === "all" ||
            community.visibility === visibility;

        return (
            searchMatch &&
            categoryMatch &&
            visibilityMatch
        );

    });

    if (loading) {

        return (

            <main className="page-shell">

                <section className="card-panel">

                    <h2>Loading Communities...</h2>

                </section>

            </main>

        );

    }

    return (

        <main className="page-shell">

            <section className="card-panel">

                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        gap: "10px"
                    }}
                >

                    <button
                        className="btn btn-outline"
                        onClick={() =>
                            navigate("/examiner/discover-communities")
                        }
                    >
                        🌍 Discover Communities
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => setOpenModal(true)}
                    >
                        + Create Community
                    </button>

                </div>

                {/* Statistics */}

                <CommunityStats
                    communities={communities}
                />

                {/* Filters */}

                <CommunityFilters

                    search={search}
                    setSearch={setSearch}

                    category={category}
                    setCategory={setCategory}

                    visibility={visibility}
                    setVisibility={setVisibility}

                />

                <hr />

                {

                    filteredCommunities.length === 0 ? (

                        <div
                            style={{
                                textAlign: "center",
                                padding: "60px 20px"
                            }}
                        >

                            <h2>
                                No Communities Found
                            </h2>

                            <p>
                                Create your first Quiz Community.
                            </p>

                        </div>

                    ) : (

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fill,minmax(320px,1fr))",
                                gap: "20px"
                            }}
                        >

                            {

                                filteredCommunities.map((community) => (

                                    <CommunityCard

                                        key={community._id}

                                        community={community}

                                        refreshCommunities={loadCommunities}

                                    />

                                ))

                            }

                        </div>

                    )

                }

            </section>

            <CreateCommunityModal

                open={openModal}

                onClose={() => setOpenModal(false)}

                onSuccess={loadCommunities}

            />

            <JoinCommunityModal

                open={joinModal}

                onClose={() => setJoinModal(false)}

                onSuccess={loadCommunities}

            />

        </main>

    );

};

export default QuizCommunities;