import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const AttemptQuiz = () => {

    const { quizId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!quizId) return;
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {

        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [timeLeft]);

    const fetchQuiz = async () => {
        try {
            const data = await apiFetch(`/quiz/${quizId}`);
            setQuiz(data.quiz);
            setQuestions(data.questions);
            setTimeLeft(data.quiz.timeLimit * 60);
        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to load quiz.");
            if (!isAuthenticated) {
              navigate("/");
            }
        }
    };

    const handleAnswer = (value) => {

        setAnswers({
            ...answers,
            [questions[currentQuestion]._id]: value
        });

    };

    const nextQuestion = () => {

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }

    };

    const previousQuestion = () => {

        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }

    };

    const submitQuiz = async () => {
        try {
            const data = await apiFetch(`/quiz/${quizId}/submit`, {
                method: "POST",
                body: JSON.stringify({ answers })
            });

            alert("Quiz Submitted Successfully");
            navigate("/aspirant/results", {
                state: data
            });
        } catch (error) {
            console.error(error);
            alert(error.message || "Server Error");
        }
    };

    if (!quiz) {
        return (
            <h2 style={{ padding: "30px" }}>
                Loading Quiz...
            </h2>
        );
    }

    if (questions.length === 0) {
        return (
            <h2 style={{ padding: "30px" }}>
                No Questions Found
            </h2>
        );
    }

    const q = questions[currentQuestion];

    return (

        <main className="page-shell">

            <section className="card-panel">

                <h1>{quiz.title}</h1>

                <h3>
                    Time Left :
                    {" "}
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                </h3>

                <hr />

                <h2>
                    Question {currentQuestion + 1} / {questions.length}
                </h2>

                <p>{q.question}</p>

                {q.questionType === "MCQ" ? (

                    q.options.map((option, index) => (

                        <label
                            key={index}
                            style={{
                                display: "block",
                                marginBottom: "10px"
                            }}
                        >

                            <input
                                type="radio"
                                name={q._id}
                                checked={answers[q._id] === option}
                                onChange={() => handleAnswer(option)}
                            />

                            {" "}
                            {option}

                        </label>

                    ))

                ) : (

                    <textarea
                        rows="5"
                        style={{ width: "100%" }}
                        value={answers[q._id] || ""}
                        onChange={(e) =>
                            handleAnswer(e.target.value)
                        }
                    />

                )}

                <br />

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "20px"
                    }}
                >

                    <button
                        className="btn btn-outline"
                        onClick={previousQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </button>

                    {currentQuestion < questions.length - 1 ? (

                        <button
                            className="btn btn-primary"
                            onClick={nextQuestion}
                        >
                            Next
                        </button>

                    ) : (

                        <button
                            className="btn btn-primary"
                            onClick={submitQuiz}
                        >
                            Submit Quiz
                        </button>

                    )}

                </div>

            </section>

        </main>

    );

};

export default AttemptQuiz;