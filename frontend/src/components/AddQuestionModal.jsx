import { useState } from "react";
import { apiFetch } from "../services/api";

const AddQuestionModal = ({
    open,
    quizId,
    onClose,
    onSuccess
}) => {

    const [form, setForm] = useState({
        question: "",
        questionType: "MCQ",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1
    });

    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const changeOption = (index, value) => {

        const temp = [...form.options];

        temp[index] = value;

        setForm({
            ...form,
            options: temp
        });

    };

    const saveQuestion = async () => {

        try {

            setLoading(true);

            await apiFetch(`/manage/question/${quizId}`, {

                method: "POST",

                body: JSON.stringify(form)

            });

            alert("Question Added Successfully");

            onSuccess();

            onClose();

        }

        catch (err) {

            alert(err.message);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="modal">

            <div className="modal-content">

                <h2>Add Question</h2>

                <textarea

                    rows="4"

                    placeholder="Enter Question"

                    value={form.question}

                    onChange={(e) =>
                        setForm({
                            ...form,
                            question: e.target.value
                        })
                    }

                />

                <br /><br />

                {

                    form.options.map((option, index) => (

                        <input

                            key={index}

                            placeholder={`Option ${index + 1}`}

                            value={option}

                            onChange={(e) =>
                                changeOption(index, e.target.value)
                            }

                        />

                    ))

                }

                <br /><br />

                <select

                    value={form.correctAnswer}

                    onChange={(e) =>
                        setForm({
                            ...form,
                            correctAnswer: e.target.value
                        })
                    }

                >

                    <option value="">Select Correct Answer</option>

                    {

                        form.options.map((option, index) => (

                            <option
                                key={index}
                                value={option}
                            >

                                {option}

                            </option>

                        ))

                    }

                </select>

                <br /><br />

                <input

                    type="number"

                    value={form.marks}

                    onChange={(e) =>
                        setForm({
                            ...form,
                            marks: Number(e.target.value)
                        })
                    }

                />

                <br /><br />

                <button

                    className="btn btn-outline"

                    onClick={onClose}

                >

                    Cancel

                </button>

                {" "}

                <button

                    className="btn btn-primary"

                    onClick={saveQuestion}

                    disabled={loading}

                >

                    {

                        loading

                        ?

                        "Saving..."

                        :

                        "Save Question"

                    }

                </button>

            </div>

        </div>

    );

};

export default AddQuestionModal;