const PerformanceFilters = ({
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    order,
    setOrder
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
                        Search Quiz
                    </label>

                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by Quiz Name or Quiz Code"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                {/* Status */}

                <div>

                    <label
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Status
                    </label>

                    <select
                        className="input-field"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >

                        <option value="all">
                            All
                        </option>

                        <option value="PASS">
                            Passed
                        </option>

                        <option value="FAIL">
                            Failed
                        </option>

                    </select>

                </div>

                {/* Sort */}

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

                        <option value="date">
                            Date
                        </option>

                        <option value="name">
                            Quiz Name
                        </option>

                        <option value="percentage">
                            Percentage
                        </option>

                    </select>

                </div>

                {/* Order */}

                <div>

                    <label
                        style={{
                            fontWeight: "bold"
                        }}
                    >
                        Order
                    </label>

                    <select
                        className="input-field"
                        value={order}
                        onChange={(e) =>
                            setOrder(e.target.value)
                        }
                    >

                        <option value="desc">
                            Descending
                        </option>

                        <option value="asc">
                            Ascending
                        </option>

                    </select>

                </div>

            </div>

        </div>

    );

};

export default PerformanceFilters;