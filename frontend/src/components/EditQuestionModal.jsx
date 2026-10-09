import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

const EditQuestionModal = ({
  open,
  question,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    questionType: "MCQ",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setForm({
        question: question.question || "",
        options: question.options || ["", "", "", ""],
        correctAnswer: question.correctAnswer || "",
        marks: question.marks || 1,
        questionType: question.questionType || "MCQ",
      });
    }
  }, [question]);

  if (!open || !question) return null;

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;

    setForm({
      ...form,
      options: updated,
    });
  };

  const saveQuestion = async () => {
    try {
      setSaving(true);

      await apiFetch(
        `/manage/question/${question._id}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        }
      );

      alert("Question Updated Successfully");

      onSuccess();

      onClose();

    } catch (error) {

      alert(error.message);

    } finally {

      setSaving(false);

    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: "750px",
          background: "#fff",
          borderRadius: "10px",
          padding: "25px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2>Edit Question</h2>

        <hr />

        <label>
          Question
        </label>

        <textarea
          rows={4}
          value={form.question}
          onChange={(e) =>
            setForm({
              ...form,
              question: e.target.value,
            })
          }
          style={{
            width: "100%",
            marginBottom: "20px",
          }}
        />

        <h3>Options</h3>

        {form.options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) =>
              handleOptionChange(
                index,
                e.target.value
              )
            }
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
            }}
          />
        ))}

        <br />

        <label>
          Correct Answer
        </label>

        <select
          value={form.correctAnswer}
          onChange={(e) =>
            setForm({
              ...form,
              correctAnswer: e.target.value,
            })
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
          }}
        >
          {form.options.map((option, index) => (
            <option
              key={index}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <label>
          Marks
        </label>

        <input
          type="number"
          min="1"
          value={form.marks}
          onChange={(e) =>
            setForm({
              ...form,
              marks: Number(e.target.value),
            })
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "25px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "end",
            gap: "15px",
          }}
        >
          <button
            className="btn btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={saveQuestion}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;