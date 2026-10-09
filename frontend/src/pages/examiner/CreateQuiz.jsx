import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import { apiFetch } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { CATEGORIES } from "../../utils/categories.js";

const CreateQuiz = () => {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchParams] = useSearchParams();

  const queryCommunityId = searchParams.get("communityId");

  const [community, setCommunity] = useState(null);
  const [myCommunities, setMyCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(queryCommunityId || "");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [examinerName, setExaminerName] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [quizCode, setQuizCode] = useState("");

  const [isPrivate, setIsPrivate] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [oneAttemptOnly, setOneAttemptOnly] = useState(false);
  const [showResultImmediately, setShowResultImmediately] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyCommunities();
    if (queryCommunityId) {
      loadCommunity(queryCommunityId);
    }
  }, [queryCommunityId]);

  const loadMyCommunities = async () => {
    try {
      const data = await apiFetch("/community/my");
      setMyCommunities(data.communities || []);
    } catch (error) {
      console.log("Error loading communities:", error);
    }
  };

  const loadCommunity = async (id) => {

    try {

      const data = await apiFetch(`/community/${id}`);

      setCommunity(data.community);
      if (data.community?.category) {
        setCategory(data.community.category);
      }
      setSelectedCommunityId(data.community?._id || id);

    } catch (error) {

      console.log(error);

    }

  };

  const handleCommunityChange = (e) => {
    const newId = e.target.value;
    setSelectedCommunityId(newId);
    if (newId) {
      const found = myCommunities.find(c => c._id === newId);
      if (found) {
        setCommunity(found);
        if (found.category) setCategory(found.category);
      }
    } else {
      setCommunity(null);
    }
  };

  const generateCode = () => {

    const code = Math.random()

      .toString(36)

      .substring(2, 8)

      .toUpperCase();

    setQuizCode(code);

  };

  const handleSubmit = async () => {

    if (!title.trim()) {

      alert("Please enter Quiz Title");

      return;

    }

    if (!examinerName.trim()) {

      alert("Please enter Examiner Name");

      return;

    }

    if (!timeLimit || timeLimit <= 0) {

      alert("Please enter valid Time Limit");

      return;

    }

    try {

      setLoading(true);

      console.log("========== CREATE QUIZ ==========");
      console.log("Community ID:", selectedCommunityId);

      console.log("Payload:", {

        title,

        category,

        examinerName:
          examinerName.trim() ||

          user?.name ||

          "Examiner",

        timeLimit: Number(timeLimit),

        quizCode,

        isPrivate,

        shuffleQuestions,

        oneAttemptOnly,

        showResultImmediately,

        communityId: selectedCommunityId || null

      });

      const response = await apiFetch(

        "/quiz/create",

        {

          method: "POST",

          body: JSON.stringify({

            title,

            category,

            examinerName:
              examinerName.trim() ||

              user?.name ||

              "Examiner",

            timeLimit: Number(timeLimit),

            quizCode,

            isPrivate,

            shuffleQuestions,

            oneAttemptOnly,

            showResultImmediately,

            communityId: selectedCommunityId || null

          })

        }

      );

      alert("Quiz Created Successfully");

      navigate(

        `/examiner/question-builder/${response.quiz._id}`

      );

    }
    catch (error) {

      console.log(error);

      alert(error.message);

    }
    finally {

      setLoading(false);

    }

  };

  return (

    <main className="page-shell">

      <section className="card-panel">

        {/* Community Banner */}

        {

          community && (

            <div
              className="control-card"
              style={{
                background: "#e8f5e9",
                borderLeft: "6px solid green",
                marginBottom: "25px"
              }}
            >

              <h3>

                📚 Creating Quiz for Community

              </h3>

              <h2>

                {community.name}

              </h2>

              <p>

                {community.description}

              </p>

              <button
                className="btn btn-outline"
                onClick={() =>

                  navigate(

                    `/examiner/quiz-communities/${selectedCommunityId}`

                  )

                }
              >

                ← Back to Community

              </button>

            </div>

          )

        }

        <h1>Create New Quiz</h1>

        <p>

          Configure your quiz settings before adding questions.

        </p>

        <label>

          Quiz Title *

          <input

            type="text"

            placeholder="Enter Quiz Title"

            value={title}

            onChange={(e) =>

              setTitle(e.target.value)

            }

          />

        </label>

        <label>

          Quiz Category *

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "14px 16px",
              background: "var(--surface-soft)",
              font: "inherit"
            }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

        </label>

        <label>

          Assign to Community (Optional)

          <select
            value={selectedCommunityId}
            onChange={handleCommunityChange}
            style={{
              width: "100%",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "14px 16px",
              background: "var(--surface-soft)",
              font: "inherit"
            }}
          >
            <option value="">None (Normal Quiz - Recommended to Students by Interest)</option>
            {myCommunities.map(c => (
              <option key={c._id} value={c._id}>
                👥 {c.name} ({c.category || "General"})
              </option>
            ))}
          </select>

        </label>

        <label>

          Examiner Name *

          <input

            type="text"

            placeholder="Enter Examiner Name"

            value={examinerName}

            onChange={(e) =>

              setExaminerName(e.target.value)

            }

          />

        </label>

        <label>

          Time Limit (Minutes) *

          <input

            type="number"

            placeholder="30"

            value={timeLimit}

            onChange={(e) =>

              setTimeLimit(e.target.value)

            }

          />

        </label>

        <label>

          Quiz Code (Optional)

          <input

            type="text"

            placeholder="JAVA2026"

            value={quizCode}

            onChange={(e) =>

              setQuizCode(e.target.value)

            }

          />

        </label>

        <button

          className="btn btn-outline"

          type="button"

          onClick={generateCode}

        >

          Generate Code

        </button>

        <br />

        <br />

        <label>

          <input

            type="checkbox"

            checked={isPrivate}

            onChange={(e) =>

              setIsPrivate(e.target.checked)

            }

          />

          {" "}Private Quiz

        </label>

        <label>

          <input

            type="checkbox"

            checked={shuffleQuestions}

            onChange={(e) =>

              setShuffleQuestions(e.target.checked)

            }

          />

          {" "}Shuffle Questions

        </label>

        <label>

          <input

            type="checkbox"

            checked={oneAttemptOnly}

            onChange={(e) =>

              setOneAttemptOnly(e.target.checked)

            }

          />

          {" "}One Attempt Only

        </label>

        <label>

          <input

            type="checkbox"

            checked={showResultImmediately}

            onChange={(e) =>

              setShowResultImmediately(

                e.target.checked

              )

            }

          />

          {" "}Show Result Immediately

        </label>

        <br />

        <button

          className="btn btn-primary btn-block"

          onClick={handleSubmit}

          disabled={loading}

        >

          {

            loading

              ? "Creating Quiz..."

              : "Create Quiz"

          }

        </button>

      </section>

    </main>

  );

};

export default CreateQuiz;