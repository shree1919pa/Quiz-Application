import { useEffect, useState } from "react";
import { apiFetch } from "../../services/api";

import PerformanceStats from "../../components/PerformanceStats";
import PerformanceFilters from "../../components/PerformanceFilters";
import PerformanceCard from "../../components/PerformanceCard";
import PerformancePagination from "../../components/PerformancePagination";

const MyPerformance = () => {

    const [statistics, setStatistics] = useState(null);
    const [performance, setPerformance] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [searchText, setSearchText] = useState("");

    const [status, setStatus] = useState("all");

    const [sortBy, setSortBy] = useState("date");

    const [order, setOrder] = useState("desc");

    const [page, setPage] = useState(1);

    useEffect(() => {

        loadPerformance();

    }, [search, status, sortBy, order, page]);

    useEffect(() => {

        const timer = setTimeout(() => {

            setSearch(searchText);

            setPage(1);

        }, 2000);

        return () => clearTimeout(timer);

    }, [searchText]);

    const loadPerformance = async () => {

        try {

            setLoading(true);

            const data = await apiFetch(

                `/performance?search=${search}&status=${status}&sortBy=${sortBy}&order=${order}&page=${page}`

            );

            setStatistics(data.statistics);

            setPerformance(data.performance);

            setPagination(data.pagination);

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

                        Loading Performance...

                    </h2>

                </section>

            </main>

        );

    }

    return (

        <main className="page-shell">

            <section className="card-panel">

                <h1>

                    My Performance

                </h1>

                <br />

                <PerformanceFilters

                    search={searchText}

                    setSearch={setSearchText}

                    status={status}

                    setStatus={setStatus}

                    sortBy={sortBy}

                    setSortBy={setSortBy}

                    order={order}

                    setOrder={setOrder}

                />

                <br />

                <PerformanceStats

                    statistics={statistics}

                />

                <br />

                {

                    performance.length === 0

                        ?

                        (

                            <h2>

                                No Performance Found

                            </h2>

                        )

                        :

                        (

                            performance.map((item) => (

                                <PerformanceCard

                                    key={item._id}

                                    item={item}

                                />

                            ))

                        )

                }

                <br />

                {

                    pagination && (

                        <PerformancePagination

                            pagination={pagination}

                            setPage={setPage}

                        />

                    )

                }

            </section>

        </main>

    );

};

export default MyPerformance;