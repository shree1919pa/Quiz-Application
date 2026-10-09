import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api.js";

const Results = () => {

    const navigate = useNavigate();

    const { state } = useLocation();
    const [resultData, setResultData] = useState(state);
    const [loading, setLoading] = useState(!state);
    const [error, setError] = useState("");

    useEffect(() => {
        if (state) return;

        const fetchLatestAttempt = async () => {
            try {
                const data = await apiFetch("/quiz/attempt/latest");
                setResultData(data);
            } catch (err) {
                setError(err.message || "Unable to load result.");
            } finally {
                setLoading(false);
            }
        };

        fetchLatestAttempt();
    }, [state]);

    if (loading) {
      return (
        <main className="page-shell">
          <section className="card-panel">
            <h1>Loading Result...</h1>
          </section>
        </main>
      );
    }

    if (!resultData || error) {
      return (
        <main className="page-shell">
          <section className="card-panel">
            <h1>No Result Found</h1>
            <p>{error || "No quiz result is available."}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/aspirant")}
            >
              Back to Dashboard
            </button>
          </section>
        </main>
      );
    }

    const score = resultData.score ?? 0;
    const totalMarks = resultData.totalMarks ?? 0;
    const correct = resultData.correct ?? (Array.isArray(resultData.answers) ? resultData.answers.filter(a => a.isCorrect).length : 0);
    const wrong = resultData.wrong ?? (Array.isArray(resultData.answers) ? resultData.answers.length - correct : 0);
    const percentage = Number(resultData.percentage ?? (totalMarks > 0 ? (score / totalMarks) * 100 : 0));

    return (

        <main className="page-shell">

            <section
                className="card-panel"
                style={{
                    maxWidth: "700px",
                    margin: "40px auto",
                    textAlign: "center"
                }}
            >

                <span className="eyebrow">

                    Quiz Submitted Successfully

                </span>

                <h1>

                    Your Last Quiz Result

                </h1>

                <hr />

                <div
                    style={{
                        marginTop: "30px",
                        marginBottom: "30px"
                    }}
                >

                    <h2>

                        Score

                    </h2>

                    <h1
                        style={{
                            color: "#2858dd",
                            fontSize: "55px"
                        }}
                    >

                        {score} / {totalMarks}

                    </h1>

                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                        textAlign: "left"
                    }}
                >

                    <div className="control-card">

                        <h3>

                            Correct Answers

                        </h3>

                        <h2
                            style={{
                                color: "green"
                            }}
                        >

                            {correct}

                        </h2>

                    </div>

                    <div className="control-card">

                        <h3>

                            Wrong Answers

                        </h3>

                        <h2
                            style={{
                                color: "red"
                            }}
                        >

                            {wrong}

                        </h2>

                    </div>

                    <div className="control-card">

                        <h3>

                            Percentage

                        </h3>

                        <h2>

                            {percentage.toFixed(2)}%

                        </h2>

                    </div>

                    <div className="control-card">

                        <h3>

                            Result

                        </h3>

                        <h2
                            style={{
                                color:
                                    percentage >= 40
                                        ? "green"
                                        : "red"
                            }}
                        >

                            {

                                percentage >= 40

                                    ? "PASS"

                                    : "FAIL"

                            }

                        </h2>

                    </div>

                </div>

                <br />

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate("/aspirant")
                    }
                >

                    Back To Dashboard

                </button>

            </section>

        </main>

    );

};

export default Results;