import { useState } from "react";
import { apiFetch } from "../services/api";
import EditQuestionModal from "./EditQuestionModal";

const QuestionCard = ({
  question,
  index,
  refreshQuestions,
}) => {

  const [loading, setLoading] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // --------------------------
  // Delete Question
  // --------------------------
  const deleteQuestion = async () => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmDelete) return;

    try {

      setLoading(true);

      await apiFetch(
        `/manage/question/${question._id}`,
        {
          method: "DELETE",
        }
      );

      alert("Question Deleted Successfully");

      refreshQuestions();

    } catch (error) {

      console.log(error);

      alert(error.message);

    } finally {

      setLoading(false);

    }

  };

  return (
    <>

      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,.08)"
        }}
      >

        <h3
          style={{
            color: "#2858dd"
          }}
        >
          Question {index + 1}
        </h3>

        <hr />

        <h4>{question.question}</h4>

        <br />

        {

          question.questionType === "MCQ"

            ?

            question.options.map((option, i) => (

              <div
                key={i}
                style={{
                  marginBottom: "10px"
                }}
              >

                <input
                  type="radio"
                  checked={
                    option === question.correctAnswer
                  }
                  readOnly
                />

                {" "}

                {option}

              </div>

            ))

            :

            <h4>
              Subjective Question
            </h4>

        }

        <br />

        <div
          style={{
            display: "flex",
            gap: "30px"
          }}
        >

          <h4>

            Correct Answer :

            <span
              style={{
                color: "green"
              }}
            >

              {" "}

              {question.correctAnswer}

            </span>

          </h4>

          <h4>

            Marks :

            {" "}

            {question.marks}

          </h4>

        </div>

        <br />

        <div
          style={{
            display: "flex",
            gap: "15px"
          }}
        >

          <button
            className="btn btn-primary"
            onClick={() =>
              setOpenEditModal(true)
            }
          >

            Edit

          </button>

          <button
            className="btn btn-danger"
            onClick={deleteQuestion}
            disabled={loading}
          >

            {

              loading

                ?

                "Deleting..."

                :

                "Delete"

            }

          </button>

        </div>

      </div>

      {/* Edit Modal */}

      <EditQuestionModal

        open={openEditModal}

        question={question}

        onClose={() =>
          setOpenEditModal(false)
        }

        onSuccess={refreshQuestions}

      />

    </>
  );

};

export default QuestionCard;