import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../services/api";

import MemberCard from "../../components/community/MemberCard";

const CommunityMembers = () => {

    const { communityId } = useParams();

    const navigate = useNavigate();

    const [members, setMembers] = useState([]);

    const [filteredMembers, setFilteredMembers] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    const [community, setCommunity] = useState(null);

    const [myMembership, setMyMembership] = useState(null);

    useEffect(() => {

        loadMembers();

    }, []);

    useEffect(() => {

        let list = [...members];

        if (search.trim()) {

            const value = search.toLowerCase();

            list = list.filter((member) =>

                member.examinerName
                    .toLowerCase()
                    .includes(value) ||

                (member.examinerEmail || "")
                    .toLowerCase()
                    .includes(value)

            );

        }

        setFilteredMembers(list);

    }, [members, search]);

    const loadMembers = async () => {

        try {

            setLoading(true);

            const data = await apiFetch(

                `/community/${communityId}/members`

            );

            setCommunity(data.community);

            setMembers(data.members);

            setFilteredMembers(data.members);

            setMyMembership(data.myMembership);

        }

        catch (error) {

            console.log(error);

            alert(error.message);

        }

        finally {

            setLoading(false);

        }

    };

    const removeMember = async (member) => {

        try {

            await apiFetch(

                `/community/${communityId}/member/${member._id}`,

                {

                    method: "DELETE"

                }

            );

            alert("Member removed successfully.");

            loadMembers();

        }

        catch (error) {

            alert(error.message);

        }

    };

    const transferOwnership = async (member) => {

        try {

            await apiFetch(

                `/community/${communityId}/owner`,

                {

                    method: "PUT",

                    body: JSON.stringify({

                        memberId: member._id

                    })

                }

            );

            alert("Ownership transferred successfully.");

            loadMembers();

        }

        catch (error) {

            alert(error.message);

        }

    };

    const toggleModerator = async (member) => {

        try {

            await apiFetch(

                `/community/${communityId}/member-role`,

                {

                    method: "PUT",

                    body: JSON.stringify({

                        memberId: member._id

                    })

                }

            );

            loadMembers();

        }

        catch (error) {

            alert(error.message);

        }

    };

    if (loading) {

        return (

            <main className="page-shell">

                <section className="card-panel">

                    <h2>

                        Loading Members...

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

                    👥 Community Members

                </h1>

                {

                    community && (

                        <p>

                            {community.name}

                        </p>

                    )

                }

                <hr />

                <div
                    className="control-card"
                    style={{
                        marginBottom: "25px"
                    }}
                >

                    <label>

                        Search Members

                    </label>

                    <input

                        className="input-field"

                        placeholder="Search by Name or Email"

                        value={search}

                        onChange={(e) =>

                            setSearch(e.target.value)

                        }

                    />

                </div>

                {

                    filteredMembers.length === 0

                        ?

                        (

                            <div
                                className="control-card"
                                style={{
                                    textAlign: "center",
                                    padding: "40px"
                                }}
                            >

                                <h3>

                                    No Members Found

                                </h3>

                            </div>

                        )

                        :

                        filteredMembers.map((member) => (

                            <MemberCard

                                key={member._id}

                                member={member}

                                currentUserRole={

                                    myMembership?.role

                                }

                                onRemove={removeMember}

                                onTransferOwnership={transferOwnership}

                                onToggleModerator={toggleModerator}

                            />

                        ))

                }

            </section>

        </main>

    );

};

export default CommunityMembers;