import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../services/api.js";

const PrivateQuiz = () => {

    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quizCode, setQuizCode] = useState("");
    const [loading, setLoading] = useState(false);

    const startQuiz = async () => {
        if (!quizCode.trim()) {
            alert("Please enter Quiz Code");
            return;
        }

        try {
            setLoading(true);
            await apiFetch(`/quiz/${quizId}/verify`, {
                method: "POST",
                body: JSON.stringify({ quizCode })
            });
            alert("Quiz Code Verified Successfully");
            navigate(`/aspirant/attempt-quiz/${quizId}`);
        } catch (error) {
            console.error(error);
            alert(error.message || "Server Error");
        } finally {
            setLoading(false);
        }
    };

    return (

        <main className="page-shell">

            <section
                className="card-panel"
                style={{
                    maxWidth: "500px",
                    margin: "40px auto"
                }}
            >

                <span className="eyebrow">
                    Private Quiz
                </span>

                <h1>Enter Quiz Code</h1>

                <p>

                    This quiz is private.

                    <br />

                    Please enter the quiz code provided by your examiner.

                </p>

                <label>

                    Quiz Code

                    <input

                        type="text"

                        placeholder="Enter Quiz Code"

                        value={quizCode}

                        onChange={(e) =>
                            setQuizCode(e.target.value)
                        }

                    />

                </label>

                <br />

                <button

                    className="btn btn-primary btn-block"

                    onClick={startQuiz}

                    disabled={loading}

                >

                    {

                        loading

                            ? "Verifying..."

                            : "Start Quiz"

                    }

                </button>

            </section>

        </main>

    );

};

export default PrivateQuiz;