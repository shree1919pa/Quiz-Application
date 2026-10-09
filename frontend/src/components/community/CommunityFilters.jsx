const CommunityFilters = ({
    search,
    setSearch,
    category,
    setCategory,
    visibility,
    setVisibility
}) => {

    return (

        <div
            className="control-card"
            style={{
                marginBottom: "25px"
            }}
        >

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: "20px"
                }}
            >

                <input
                    className="input-field"
                    placeholder="Search Community..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    className="input-field"
                    value={category}
                    onChange={(e) =>
                        setCategory(e.target.value)
                    }
                >

                    <option value="all">
                        All Categories
                    </option>

                    <option value="Programming">
                        Programming
                    </option>

                    <option value="Engineering">
                        Engineering
                    </option>

                    <option value="Medical">
                        Medical
                    </option>

                    <option value="Placement">
                        Placement
                    </option>

                    <option value="School">
                        School
                    </option>

                    <option value="College">
                        College
                    </option>

                    <option value="Government Exams">
                        Government Exams
                    </option>

                    <option value="Others">
                        Others
                    </option>

                </select>

                <select
                    className="input-field"
                    value={visibility}
                    onChange={(e) =>
                        setVisibility(e.target.value)
                    }
                >

                    <option value="all">
                        All Communities
                    </option>

                    <option value="public">
                        Public
                    </option>

                    <option value="private">
                        Private
                    </option>

                </select>

            </div>

        </div>

    );

};

export default CommunityFilters;