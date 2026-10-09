import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../../services/api.js";

const QuestionBuilder = () => {

    const { quizId } = useParams();
    const navigate = useNavigate();

    const [questionType, setQuestionType] =
        useState("MCQ");

    const [question, setQuestion] =
        useState("");

    const [optionA, setOptionA] =
        useState("");

    const [optionB, setOptionB] =
        useState("");

    const [optionC, setOptionC] =
        useState("");

    const [optionD, setOptionD] =
        useState("");

    const [correctAnswer, setCorrectAnswer] =
        useState("");

    const [marks, setMarks] =
        useState(1);

    const saveQuestion = async () => {

        try {

            const payload = {
                questionType,
                question,
                marks
            };

            if (questionType === "MCQ") {

                payload.options = [
                    optionA,
                    optionB,
                    optionC,
                    optionD
                ];

                payload.correctAnswer =
                    correctAnswer;

            } else {

                payload.correctAnswer =
                    correctAnswer;

            }

            const data = await apiFetch(`/quiz/${quizId}/question`, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            alert("Question Added");

            setQuestion("");
            setOptionA("");
            setOptionB("");
            setOptionC("");
            setOptionD("");
            setCorrectAnswer("");
            setMarks(1);

        } catch (error) {

            console.log(error);

        }
    };

    const publishQuiz = async () => {

    try {

        // Save the current question first
        if (question.trim() !== "") {

            const payload = {
                questionType,
                question,
                marks
            };

            if (questionType === "MCQ") {

                payload.options = [
                    optionA,
                    optionB,
                    optionC,
                    optionD
                ];

                payload.correctAnswer = correctAnswer;

            } else {

                payload.correctAnswer = correctAnswer;

            }

            await apiFetch(`/quiz/${quizId}/question`, {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        // Now publish the quiz
        const publishData = await apiFetch(`/quiz/${quizId}/publish`, {
            method: "PUT"
        });

        alert("Quiz Published Successfully");

        navigate("/examiner");

    } catch (error) {

        console.log(error);
        alert("Error Publishing Quiz");

    }
};

    return (
        <div className="page-shell">

            <div className="card-panel">

                <h1>Question Builder</h1>

                <label>
                    Question Type

                    <select
                        value={questionType}
                        onChange={(e) =>
                            setQuestionType(
                                e.target.value
                            )
                        }
                    >
                        <option value="MCQ">
                            MCQ
                        </option>

                        <option value="Theory">
                            Theory
                        </option>
                    </select>
                </label>

                <label>
                    Question
                    <textarea
                        rows="4"
                        value={question}
                        onChange={(e) =>
                            setQuestion(
                                e.target.value
                            )
                        }
                    />
                </label>

                {questionType === "MCQ" && (

                    <>
                        <label>
                            Option A
                            <input
                                value={optionA}
                                onChange={(e) =>
                                    setOptionA(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            Option B
                            <input
                                value={optionB}
                                onChange={(e) =>
                                    setOptionB(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            Option C
                            <input
                                value={optionC}
                                onChange={(e) =>
                                    setOptionC(
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label>
                            Option D
                            <input
                                value={optionD}
                                onChange={(e) =>
                                    setOptionD(
                                        e.target.value
                                    )
                                }
                            />
                        </label>
                    </>
                )}

                <label>
                    Correct Answer

                    <input
                        value={correctAnswer}
                        onChange={(e) =>
                            setCorrectAnswer(
                                e.target.value
                            )
                        }
                    />
                </label>

                <label>
                    Marks

                    <input
                        type="number"
                        value={marks}
                        onChange={(e) =>
                            setMarks(
                                e.target.value
                            )
                        }
                    />
                </label>

                <div
                    style={{
                        display: "flex",
                        gap: "15px",
                        marginTop: "20px"
                    }}
                >
                    <button
                        className="btn btn-primary"
                        onClick={saveQuestion}
                    >
                        Add Question
                    </button>

                    <button
                        className="btn btn-outline"
                        onClick={publishQuiz}
                    >
                        Publish Quiz
                    </button>
                </div>

            </div>

        </div>
    );
};

export default QuestionBuilder;