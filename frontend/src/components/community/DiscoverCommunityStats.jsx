const DiscoverCommunityStats = ({ communities }) => {

    const total = communities.length;

    const publicCount = communities.filter(

        c => c.visibility === "public"

    ).length;

    const privateCount = communities.filter(

        c => c.visibility === "private"

    ).length;

    return (

        <div
            style={{
                display: "grid",
                gridTemplateColumns:
                    "repeat(auto-fit,minmax(220px,1fr))",
                gap: "20px",
                marginBottom: "25px"
            }}
        >

            <div className="control-card">

                <h3>Total Communities</h3>

                <h1>{total}</h1>

            </div>

            <div className="control-card">

                <h3>Public Communities</h3>

                <h1>{publicCount}</h1>

            </div>

            <div className="control-card">

                <h3>Private Communities</h3>

                <h1>{privateCount}</h1>

            </div>

        </div>

    );

};

export default DiscoverCommunityStats;