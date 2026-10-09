const PerformancePagination = ({ pagination, setPage }) => {

    if (!pagination) return null;

    const {

        currentPage,

        totalPages

    } = pagination;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {

        pages.push(i);

    }

    return (

        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "30px",
                flexWrap: "wrap"
            }}
        >

            {/* Previous Button */}

            <button

                className="btn btn-outline"

                disabled={currentPage === 1}

                onClick={() => setPage(currentPage - 1)}

            >

                ← Previous

            </button>

            {/* Page Numbers */}

            {

                pages.map((page) => (

                    <button

                        key={page}

                        className={
                            page === currentPage
                                ? "btn btn-primary"
                                : "btn btn-outline"
                        }

                        onClick={() => setPage(page)}

                    >

                        {page}

                    </button>

                ))

            }

            {/* Next Button */}

            <button

                className="btn btn-outline"

                disabled={currentPage === totalPages}

                onClick={() => setPage(currentPage + 1)}

            >

                Next →

            </button>

        </div>

    );

};

export default PerformancePagination;