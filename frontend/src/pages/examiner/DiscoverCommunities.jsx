import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

import DiscoverCommunityCard from "../../components/community/DiscoverCommunityCard";
import DiscoverCommunityFilters from "../../components/community/DiscoverCommunityFilters";
import DiscoverCommunityStats from "../../components/community/DiscoverCommunityStats";

const DiscoverCommunities = () => {

    const navigate = useNavigate();

    const [communities, setCommunities] = useState([]);
    const [filteredCommunities, setFilteredCommunities] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [visibility, setVisibility] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {

        loadCommunities();

    }, []);

    useEffect(() => {

        let list = [...communities];

        /* ---------------- Search ---------------- */

        if (search.trim()) {

            const value = search.toLowerCase();

            list = list.filter((community) =>

                community.name.toLowerCase().includes(value) ||

                community.ownerName.toLowerCase().includes(value)

            );

        }

        /* ---------------- Category Filter ---------------- */

        if (category !== "all") {

            list = list.filter(

                (community) => community.category === category

            );

        }

        /* ---------------- Visibility Filter ---------------- */

        if (visibility !== "all") {

            list = list.filter(

                (community) => community.visibility === visibility

            );

        }

        /* ---------------- Sorting ---------------- */

        switch (sortBy) {

            case "name":

                list.sort((a, b) =>

                    a.name.localeCompare(b.name)

                );

                break;

            case "members":

                list.sort(

                    (a, b) =>

                        b.totalMembers - a.totalMembers

                );

                break;

            case "oldest":

                list.sort(

                    (a, b) =>

                        new Date(a.createdAt) -

                        new Date(b.createdAt)

                );

                break;

            default:

                list.sort(

                    (a, b) =>

                        new Date(b.createdAt) -

                        new Date(a.createdAt)

                );

        }

        setFilteredCommunities(list);

    }, [

        communities,

        search,

        category,

        visibility,

        sortBy

    ]);

    const loadCommunities = async () => {

        try {

            setLoading(true);

            const data = await apiFetch(

                "/community/discover"

            );

            setCommunities(data.communities);

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

                    <h2>

                        Loading Communities...

                    </h2>

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

                <h1>

                    🌍 Discover Communities

                </h1>

                <p>

                    Browse communities created by other examiners and join the ones that match your interests.

                </p>

                <hr />

                {/* Statistics */}

                <DiscoverCommunityStats

                    communities={communities}

                />

                <br />

                {/* Filters */}

                <DiscoverCommunityFilters

                    search={search}
                    setSearch={setSearch}

                    category={category}
                    setCategory={setCategory}

                    visibility={visibility}
                    setVisibility={setVisibility}

                    sortBy={sortBy}
                    setSortBy={setSortBy}

                />

                <br />

                {

                    filteredCommunities.length === 0

                        ?

                        (

                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "50px 0"
                                }}
                            >

                                <h2>

                                    No Communities Found

                                </h2>

                                <p>

                                    Try changing your search or filters.

                                </p>

                            </div>

                        )

                        :

                        (

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill,minmax(340px,1fr))",
                                    gap: "20px"
                                }}
                            >

                                {

                                    filteredCommunities.map((community) => (

                                        <DiscoverCommunityCard

                                            key={community._id}

                                            community={community}

                                            refresh={loadCommunities}

                                        />

                                    ))

                                }

                            </div>

                        )

                }

            </section>

        </main>

    );

};

export default DiscoverCommunities;