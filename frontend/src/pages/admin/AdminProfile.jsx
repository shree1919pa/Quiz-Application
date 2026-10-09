import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { apiFetch } from '../../services/api';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/admin/profile');
      if (res?.success) {
        setProfile(res.user);
      }
    } catch (err) {
      console.error('Failed to load admin profile:', err);
      setError(err.message || 'Failed to fetch administrator profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Validation rules for password policy
  const hasMinLength = newPassword.length >= 12;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[@$!%*?&#^()_\-+={}[\]:;"'<>,./~`|\\]/.test(newPassword);
  const isPolicySatisfied = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    if (!isPolicySatisfied) {
      setPasswordError('New password does not meet the complexity requirements.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await apiFetch('/admin/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (res?.success) {
        setPasswordSuccess('Administrator password updated successfully! Please note your new credentials.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError(err.message || 'Failed to update administrator password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Administrator Profile"
      subtitle="Security parameters, account standing, and master credential management"
    >
      {error && <div className="error-message">{error}</div>}

      <div className="cards-grid">
        {/* Profile Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Admin Identity</h3>
              <p>Master account holding administrative privilege</p>
            </div>
            <span className="badge badge-admin">Master Administrator</span>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <h4>Loading profile...</h4>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div
                  className="profile-avatar-large"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    fontSize: '1.6rem'
                  }}
                >
                  🛡️
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f1c3f' }}>
                    {profile?.name || 'Administrator'}
                  </h2>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {profile?.email || 'admin17@gmail.com'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'grid', gap: '12px' }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#64748b' }}>SYSTEM ROLE:</strong>
                  <div style={{ fontWeight: 600, color: '#0f1c3f' }}>Platform Administrator</div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#64748b' }}>ACCOUNT PROVISIONING:</strong>
                  <div style={{ color: '#334155', fontSize: '0.9rem' }}>
                    Environment Configured & Database Initialized
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#64748b' }}>REGISTERED DATE:</strong>
                  <div style={{ color: '#334155', fontSize: '0.9rem' }}>
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'System Seeded'}
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#64748b' }}>ACCESS LEVEL:</strong>
                  <div>
                    <span className="badge badge-approved">Full Administrative Authority</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3>Update Admin Password</h3>
              <p>Securely change your administrator credentials</p>
            </div>
            <span style={{ fontSize: '1.2rem' }}>🔒</span>
          </div>

          {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
          {passwordError && <div className="error-message">{passwordError}</div>}

          <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gap: '14px' }}>
            <label>
              Current Admin Password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </label>

            <label>
              New Admin Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </label>

            {/* Password Policy Live Checklist */}
            <div
              style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                display: 'grid',
                gap: '6px'
              }}
            >
              <strong style={{ color: '#475569', marginBottom: '2px' }}>
                Password Complexity Requirements:
              </strong>
              <div style={{ color: hasMinLength ? '#059669' : '#94a3b8' }}>
                {hasMinLength ? '✓' : '○'} Minimum 12 characters
              </div>
              <div style={{ color: hasUpperCase ? '#059669' : '#94a3b8' }}>
                {hasUpperCase ? '✓' : '○'} At least one uppercase letter (A-Z)
              </div>
              <div style={{ color: hasLowerCase ? '#059669' : '#94a3b8' }}>
                {hasLowerCase ? '✓' : '○'} At least one lowercase letter (a-z)
              </div>
              <div style={{ color: hasNumber ? '#059669' : '#94a3b8' }}>
                {hasNumber ? '✓' : '○'} At least one numeric digit (0-9)
              </div>
              <div style={{ color: hasSpecialChar ? '#059669' : '#94a3b8' }}>
                {hasSpecialChar ? '✓' : '○'} At least one special character (!@#$%^&*...)
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordLoading || !isPolicySatisfied}
              style={{ marginTop: '6px' }}
            >
              {passwordLoading ? 'Encrypting & Updating...' : 'Update Admin Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
