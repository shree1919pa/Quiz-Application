const DiscoverCommunityFilters = ({
    search,
    setSearch,
    category,
    setCategory,
    visibility,
    setVisibility,
    sortBy,
    setSortBy
}) => {

    return (

        <div
            className="control-card"
            style={{
                padding: "20px"
            }}
        >

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: "15px",
                    alignItems: "end"
                }}
            >

                {/* Search */}

                <div>

                    <label
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Search Community
                    </label>

                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by Community Name or Owner"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                {/* Category */}

                <div>

                    <label
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Category
                    </label>

                    <select
                        className="input-field"
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >

                        <option value="all">All</option>

                        <option value="Programming">
                            Programming
                        </option>

                        <option value="Engineering">
                            Engineering
                        </option>

                        <option value="Medical">
                            Medical
                        </option>

                        <option value="Aptitude">
                            Aptitude
                        </option>

                        <option value="Reasoning">
                            Reasoning
                        </option>

                        <option value="Language">
                            Language
                        </option>

                    </select>

                </div>

                {/* Visibility */}

                <div>

                    <label
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Visibility
                    </label>

                    <select
                        className="input-field"
                        value={visibility}
                        onChange={(e) =>
                            setVisibility(e.target.value)
                        }
                    >

                        <option value="all">
                            All
                        </option>

                        <option value="public">
                            🌍 Public
                        </option>

                        <option value="private">
                            🔒 Private
                        </option>

                    </select>

                </div>

                {/* Sort By */}

                <div>

                    <label
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Sort By
                    </label>

                    <select
                        className="input-field"
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value)
                        }
                    >

                        <option value="newest">
                            Newest
                        </option>

                        <option value="oldest">
                            Oldest
                        </option>

                        <option value="name">
                            A-Z
                        </option>

                        <option value="members">
                            Members
                        </option>

                    </select>

                </div>

            </div>

        </div>

    );

};

export default DiscoverCommunityFilters;