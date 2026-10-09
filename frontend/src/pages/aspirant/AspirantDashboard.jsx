import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiFetch } from '../../services/api.js'
import { getCategoryIcon } from '../../utils/categories.js'

const AspirantDashboard = () => {
  const [name, setName] = useState('Aspirant')
  const [interests, setInterests] = useState([])
  const [recommendedQuizzes, setRecommendedQuizzes] = useState([])
  const [communityStats, setCommunityStats] = useState({ joinedCount: 0, totalQuizzes: 0 })
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    setName(user.fullName || user.name || 'Aspirant')
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // 1. Fetch published quizzes (recommended based on interests)
      const quizData = await apiFetch('/quiz/published').catch(() => ({ quizzes: [], studentInterests: [] }))
      setRecommendedQuizzes(quizData.quizzes || [])
      setInterests(quizData.studentInterests || user?.interests || [])

      // 2. Fetch community quizzes metadata
      const commData = await apiFetch('/student/community-quizzes').catch(() => ({ joinedCommunitiesCount: 0, totalQuizzes: 0 }))
      setCommunityStats({
        joinedCount: commData.joinedCommunitiesCount || 0,
        totalQuizzes: commData.totalQuizzes || 0
      })
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const links = [
    { label: '🏠 Dashboard', path: '/aspirant' },
    { label: '🎯 Quizzes', path: '/aspirant/available-quizzes' },
    { label: '👥 Discover Communities', path: '/aspirant/discover-communities' },
    { label: '👥 My Communities', path: '/aspirant/my-communities' },
    { label: '📝 Community Quizzes', path: '/aspirant/community-quizzes' },
    { label: '⚙️ My Interests', path: '/aspirant/select-interests' },
    { label: '📈 My Performance', path: '/aspirant/my-performance' },
    { label: '📝 Results', path: '/aspirant/results' },
    { label: '👤 Profile', path: '/aspirant/profile' },
  ]

  return (
    <div className="dashboard-page">
      <Sidebar links={links} />
      <section className="dashboard-content">
        {/* Welcome Header */}
        <div className="dashboard-head">
          <div>
            <span className="eyebrow">Aspirant Portal</span>
            <h1>Welcome, {name}!</h1>
            <p>Access your personalized interest-based recommendations, joined community quizzes, and analytics.</p>
            
            {/* Interests Chips */}
            {interests.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--muted)' }}>🎯 My Interests:</span>
                {interests.map((interest, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    {getCategoryIcon(interest)} {interest}
                  </span>
                ))}
                <button
                  className="link-button"
                  style={{ fontSize: '0.8rem', padding: '2px 8px', textDecoration: 'underline' }}
                  onClick={() => navigate('/aspirant/select-interests')}
                >
                  Edit Interests
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => { logout(); navigate('/') }}>
            Logout
          </button>
        </div>

        {/* ==================================================== */}
        {/* 👥 COMMUNITY QUIZZES SPOTLIGHT BANNER */}
        {/* ==================================================== */}
        <div
          className="control-card"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '28px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 12px 32px rgba(37, 99, 235, 0.25)'
          }}
        >
          <div>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              👥 Community Hub
            </span>
            <h2 style={{ margin: '10px 0 6px', color: '#ffffff', fontSize: '1.6rem' }}>
              Community Quizzes
            </h2>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', maxWidth: '550px' }}>
              Explore and take exclusive quizzes created within your joined communities ({communityStats.joinedCount} joined, {communityStats.totalQuizzes} quizzes available).
            </p>
          </div>

          <button
            className="btn"
            style={{
              background: '#ffffff',
              color: '#1e3a8a',
              fontWeight: '700',
              padding: '14px 24px',
              fontSize: '0.95rem',
              borderRadius: '16px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
            }}
            onClick={() => navigate('/aspirant/community-quizzes')}
          >
            👥 View Community Quizzes →
          </button>
        </div>

        {/* ==================================================== */}
        {/* 🎯 RECOMMENDED / INTEREST-BASED EXAMS SECTION */}
        {/* ==================================================== */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>🎯 Recommended Exams</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Handpicked exams matching your selected fields of interest.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-outline"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => navigate('/aspirant/select-interests')}
              >
                ⚙️ My Interests
              </button>
              <button
                className="btn btn-outline"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                onClick={() => navigate('/aspirant/available-quizzes')}
              >
                View All ({recommendedQuizzes.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="control-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p>Loading your recommendations...</p>
            </div>
          ) : interests.length === 0 ? (
            /* No interests selected */
            <div className="control-card" style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px dashed var(--border)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🎯</span>
              <h3>Please select your interests to see recommended exams</h3>
              <p style={{ color: 'var(--muted)', maxWidth: '480px', margin: '8px auto 20px' }}>
                Select categories such as Programming, Mathematics, Science or Medical to receive tailored exam suggestions.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/aspirant/select-interests')}
              >
                Select Interests Now
              </button>
            </div>
          ) : recommendedQuizzes.length === 0 ? (
            /* No matching quizzes */
            <div className="control-card" style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px dashed var(--border)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>📚</span>
              <h3>No exams are available for your selected interests</h3>
              <p style={{ color: 'var(--muted)', maxWidth: '480px', margin: '8px auto 20px' }}>
                There are currently no published exams matching your interests ({interests.join(', ')}). You can expand your interests anytime.
              </p>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/aspirant/select-interests')}
              >
                ⚙️ Adjust Interests
              </button>
            </div>
          ) : (
            /* Grid of Recommended Quizzes (up to 4 on dashboard) */
            <div className="cards-grid">
              {recommendedQuizzes.slice(0, 4).map(quiz => {
                const icon = getCategoryIcon(quiz.category)
                return (
                  <article
                    key={quiz._id}
                    className="control-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1.5px solid var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: '700'
                        }}>
                          {icon} {quiz.category || 'General'}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '600' }}>
                          ⏱ {quiz.timeLimit} Mins
                        </span>
                      </div>

                      <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>{quiz.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0 0 14px' }}>
                        👨‍🏫 Examiner: {quiz.examinerName} • ❓ {quiz.totalQuestions || 0} Questions
                      </p>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      {quiz.isPrivate ? (
                        <button
                          className="btn btn-outline btn-block"
                          style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                          onClick={() => navigate(`/aspirant/private-quiz/${quiz._id}`)}
                        >
                          🔑 Enter Quiz Code
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-block"
                          style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                          onClick={() => navigate(`/aspirant/attempt-quiz/${quiz._id}`)}
                        >
                          🚀 Start Quiz
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Navigation Cards */}
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>⚡ Quick Actions</h2>
          <div className="cards-grid">
            <article 
              className="control-card" 
              style={{ cursor: "pointer", border: '1.5px solid var(--border)' }}
              onClick={() => navigate("/aspirant/discover-communities")}
            >
              <h3>🌍 Discover Communities</h3>
              <p>Explore and join examiner and study communities matching your interests.</p>
            </article>

            <article 
              className="control-card" 
              style={{ cursor: "pointer", border: '1.5px solid var(--border)' }}
              onClick={() => navigate("/aspirant/my-communities")}
            >
              <h3>👥 My Communities</h3>
              <p>View your joined communities, membership details, and community quizzes.</p>
            </article>

            <article 
              className="control-card" 
              style={{ cursor: "pointer", border: '1.5px solid var(--border)' }}
              onClick={() => navigate("/aspirant/community-quizzes")}
            >
              <h3>📝 Community Quizzes</h3>
              <p>Browse and attempt all published quizzes in your joined communities.</p>
            </article>

            <article 
              className="control-card" 
              style={{ cursor: "pointer", border: '1.5px solid var(--border)' }}
              onClick={() => navigate("/aspirant/select-interests")}
            >
              <h3>⚙️ My Interests</h3>
              <p>Customize your exam subjects, preferences, and recommendation filters.</p>
            </article>

            <article 
              className="control-card" 
              style={{ cursor: "pointer", border: '1.5px solid var(--border)' }}
              onClick={() => navigate("/aspirant/my-performance")}
            >
              <h3>📈 My Performance</h3>
              <p>Review your quiz history, scores, pass rates, and detailed analytics.</p>
            </article>

            <article 
              className="control-card" 
              style={{ cursor: "pointer", border: '1.5px solid var(--border)' }}
              onClick={() => navigate("/aspirant/results")}
            >
              <h3>📝 Last Result</h3>
              <p>See the score breakdown and question answers from your most recent attempt.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AspirantDashboard
