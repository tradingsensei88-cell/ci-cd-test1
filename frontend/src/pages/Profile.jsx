import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Key, ShieldCheck, ClipboardList } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Profile = () => {
  const { user, login, register, updateProfile, loading } = useContext(AuthContext);
  const showToast = useToast();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Login/Register Mode Toggle
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile Update Fields
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Set initial update fields when user state loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fulfill credentials', 'error');
      return;
    }

    try {
      if (isLoginMode) {
        await login(email, password);
        showToast('Successfully authenticated!', 'success');
      } else {
        if (!name) {
          showToast('Please provide a name', 'error');
          return;
        }
        if (password !== confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }
        await register(name, email, password);
        showToast('Account successfully created!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (profilePassword && profilePassword !== profileConfirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        name: profileName,
        email: profileEmail,
        password: profilePassword || undefined,
      });
      showToast('Profile updated successfully!', 'success');
      setProfilePassword('');
      setProfileConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'var(--accent-neon)', textAlign: 'center', padding: '100px 0', fontFamily: 'var(--font-display)' }}>
        SYNCING SECURE PROFILE SERVICES...
      </div>
    );
  }

  return (
    <div className="container page-wrapper profile-page animated-fade-in">
      {!user ? (
        /* Login / Register Portal */
        <div className="auth-portal-wrapper glass-panel">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLoginMode ? 'active' : ''}`}
              onClick={() => setIsLoginMode(true)}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
              onClick={() => setIsLoginMode(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {!isLoginMode && (
              <div className="form-group">
                <label>Name</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@domain.com"
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-control"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <Key size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-neon-filled auth-btn">
              {isLoginMode ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {isLoginMode && (
            <div className="demo-credentials">
              <h5>🔑 Demo Access Portals</h5>
              <p>Standard Customer: <code>user@aethersound.com</code> / <code>user123</code></p>
              <p>Admin Operations: <code>admin@aethersound.com</code> / <code>admin123</code></p>
            </div>
          )}
        </div>
      ) : (
        /* User Profile Account Info */
        <div className="profile-dashboard-layout">
          {/* Menu Sidebar */}
          <aside className="profile-menu glass-panel">
            <div className="profile-meta-block">
              <div className="avatar-circle">
                <User size={32} />
              </div>
              <h3>{user.name}</h3>
              <span className="role-tag">
                {user.isAdmin ? <><ShieldCheck size={14} /> Administrator</> : 'Valued Customer'}
              </span>
            </div>

            <nav className="profile-nav-links">
              <Link to="/orders" className="profile-nav-item">
                <ClipboardList size={18} /> My Orders
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="profile-nav-item admin-item">
                  <ShieldCheck size={18} /> Admin Dashboard
                </Link>
              )}
            </nav>
          </aside>

          {/* Form Content Area */}
          <main className="profile-content-area glass-panel">
            <h3>ACCOUNT SECURITY & PARAMETERS</h3>
            <form onSubmit={handleProfileUpdate} className="profile-update-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="password-update-segment">
                <h4>Change Password (Optional)</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Leave blank to keep same"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={profileConfirmPassword}
                      onChange={(e) => setProfileConfirmPassword(e.target.value)}
                      placeholder="Leave blank to keep same"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={updating} className="btn-neon-filled">
                {updating ? 'SAVING CHANGES...' : 'SAVE PARAMETERS'}
              </button>
            </form>
          </main>
        </div>
      )}

      <style>{`
        .auth-portal-wrapper {
          max-width: 500px;
          margin: 0 auto;
          padding: 40px;
        }
        .auth-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 30px;
        }
        .auth-tab {
          flex: 1;
          padding: 12px;
          text-align: center;
          font-family: var(--font-display);
          font-size: 1.1rem;
          color: var(--text-secondary);
          transition: var(--transition);
          border-bottom: 2px solid transparent;
        }
        .auth-tab.active {
          color: var(--accent-neon);
          border-bottom-color: var(--accent-neon);
          text-shadow: 0 0 10px var(--accent-neon-glow);
        }
        
        .input-with-icon {
          position: relative;
        }
        .input-with-icon svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon .form-control {
          padding-left: 44px;
        }
        .auth-btn {
          width: 100%;
          margin-top: 16px;
          padding: 12px;
        }
        .demo-credentials {
          margin-top: 32px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
        }
        .demo-credentials h5 {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--accent-neon);
          margin-bottom: 8px;
        }
        .demo-credentials p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        .demo-credentials code {
          background: #000;
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-primary);
        }

        /* Profile Layout */
        .profile-dashboard-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
          align-items: start;
        }
        .profile-menu {
          padding: 32px 24px;
          text-align: center;
        }
        .profile-meta-block {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(57, 255, 20, 0.05);
          border: 1px solid rgba(57, 255, 20, 0.2);
          color: var(--accent-neon);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .profile-meta-block h3 {
          font-size: 1.25rem;
          margin-bottom: 8px;
        }
        .role-tag {
          font-size: 0.8rem;
          font-family: var(--font-display);
          color: var(--accent-neon);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(57, 255, 20, 0.03);
          border: 1px solid rgba(57, 255, 20, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }
        .profile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .profile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: var(--transition);
          font-family: var(--font-display);
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .profile-nav-item:hover {
          color: var(--accent-neon);
          background: rgba(57, 255, 20, 0.05);
          border-color: var(--border-glass-hover);
        }
        .profile-nav-item.admin-item {
          color: var(--accent-neon);
          border-color: rgba(57, 255, 20, 0.2);
        }
        .profile-nav-item.admin-item:hover {
          background: rgba(57, 255, 20, 0.15);
        }

        .profile-content-area {
          padding: 40px;
        }
        .profile-content-area h3 {
          font-size: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 16px;
          margin-bottom: 30px;
        }
        .password-update-segment {
          margin-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
          margin-bottom: 24px;
        }
        .password-update-segment h4 {
          font-size: 1.05rem;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .profile-dashboard-layout {
            grid-template-columns: 1fr;
          }
          .profile-content-area {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
