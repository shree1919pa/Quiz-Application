import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

const ManageQuestions = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await apiFetch("/manage/quizzes");
      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <section className="card-panel">
          <h2>Loading Quizzes...</h2>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">

      <section className="card-panel">

        <h1>Manage Questions</h1>

        <p>
          Select a quiz to edit its questions.
        </p>

        <br />

        {quizzes.length === 0 ? (
          <h3>No Quiz Found</h3>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#2858dd",
                  color: "white"
                }}
              >
                <th style={{ padding: "12px" }}>Quiz Name</th>
                <th>Status</th>
                <th>Quiz Type</th>
                <th>Time</th>
                <th>Attempts</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {quizzes.map((quiz) => (

                <tr
                  key={quiz._id}
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid #ddd"
                  }}
                >

                  <td style={{ padding: "12px" }}>
                    {quiz.title}
                  </td>

                  <td>
                    {quiz.status}
                  </td>

                  <td>
                    {quiz.type}
                  </td>

                  <td>
                    {quiz.timeLimit} Min
                  </td>

                  <td>
                    {quiz.oneAttemptOnly
                      ? "One Attempt"
                      : "Multiple"}
                  </td>

                  <td>

                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        navigate(
                          `/examiner/manage-questions/${quiz._id}`
                        )
                      }
                    >
                      Manage Questions
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        )}

      </section>

    </main>
  );
};

export default ManageQuestions;