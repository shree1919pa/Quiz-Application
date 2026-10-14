import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { API_BASE_URL } from '../../services/api.js';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Ensure fields always start empty when page mounts
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  const handleAdminLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid administrator credentials.');
        return;
      }

      // Save token and admin role to auth context
      login(data.token, 'admin');

      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('[AdminLogin] Error:', err);
      setError('Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-wrapper">
      <section className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            🛡️
          </div>
          <h2>Admin Portal</h2>
          <p>Secure administrative access for system oversight</p>
        </div>

        <form onSubmit={handleAdminLogin} autoComplete="off" style={{ display: 'grid', gap: '16px' }}>
          <label>
            Admin Email Address
            <input
              type="email"
              name="admin_email"
              id="admin_email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </label>

          <label>
            Admin Password
            <input
              type="password"
              name="admin_password"
              id="admin_password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '6px' }}>
          <Link to="/" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to User Login
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
