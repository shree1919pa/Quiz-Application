import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

import QuizInformation from "../../components/QuizInformation";
import QuestionCard from "../../components/QuestionCard";
import AddQuestionModal from "../../components/AddQuestionModal";

const EditQuizQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);

      const data = await apiFetch(`/manage/quizzes/${quizId}`);

      if (data.success) {
        setQuiz(data.quiz);
        setQuestions(data.questions || []);
      } else {
        alert(data.message || "Unable to load quiz.");
      }
    } catch (error) {
      console.error("Load Quiz Error:", error);

      alert(error.message || "Unable to load quiz.");
    } finally {
      setLoading(false);
    }
  };

  const republishQuiz = async () => {

    const ok = window.confirm(

        "Republish this quiz?"

    );

    if (!ok) return;

    try {

        await apiFetch(

            `/manage/republish/${quizId}`,

            {

                method: "PUT"

            }

        );

        alert(

            "Quiz Republished Successfully"

        );

        loadQuiz();

    }

    catch (err) {

        alert(err.message);

    }

};

  if (loading) {
    return (
      <main className="page-shell">
        <section className="card-panel">
          <h2 style={{ textAlign: "center" }}>
            Loading Quiz...
          </h2>
        </section>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="page-shell">
        <section className="card-panel">

          <h2>Quiz Not Found</h2>

          <br />

          <button
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">

      <section className="card-panel">

        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <br />
        <br />

        <h1>Edit Quiz Questions</h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px"
          }}
        >
          Manage, edit, delete and add questions for this quiz.
        </p>

        {/* Quiz Information */}

        <QuizInformation quiz={quiz} />

        <hr />

        <h2>

          Questions ({questions.length})

        </h2>

        <br />

        {questions.length === 0 ? (

          <div
            style={{
              textAlign: "center",
              padding: "40px"
            }}
          >
            <h3>No Questions Found</h3>

            <p>
              Click <b>Add Question</b> to create your first question.
            </p>
          </div>

        ) : (

          questions.map((question, index) => (

            <QuestionCard
              key={question._id}
              question={question}
              index={index}
              refreshQuestions={loadQuiz}
            />

          ))

        )}

        <br />

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap"
          }}
        >

          <button
            className="btn btn-primary"
            disabled={!quiz}
            onClick={() => setOpenAddModal(true)}
          >
            + Add Question
          </button>

          <button
            className="btn btn-success"
            onClick={republishQuiz}
          >
            Republish Quiz
          </button>

        </div>

      </section>

      <AddQuestionModal
        open={openAddModal}
        quizId={quizId}
        onClose={() => setOpenAddModal(false)}
        onSuccess={loadQuiz}
      />

    </main>
  );
};

export default EditQuizQuestions;