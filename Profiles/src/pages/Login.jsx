import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import styles from './style/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('error');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter a username and password');
      return;
    }
    setLoading(true);
    setStatusMessage('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatusType('error');
        setStatusMessage(data.message || 'Login failed. Please check your details and try again.');
        return;
      }
      login(data);
      navigate('/profile');
    } catch (error) {
      console.error(error);
      setStatusType('error');
      setStatusMessage('Server not reachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      {stars.map((st, i) => (
        <div
          key={i}
          className={styles.star}
          style={{
            width: st.size,
            height: st.size,
            top: st.top,
            left: st.left,
            animationDuration: st.duration,
            animationDelay: st.delay,
            opacity: st.opacity,
          }}
        />
      ))}

      <form onSubmit={handleLogin} className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>FamLogs</p>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to keep your family memories close.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Username</label>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordField}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.rememberLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
          <button type="button" className={styles.forgotBtn}>
            Forgot password?
          </button>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        {statusMessage && (
          <div className={`${styles.statusMessage} ${styles[statusType]}`} role="status" aria-live="polite">
            {statusMessage}
          </div>
        )}

        <p className={styles.registerText}>
          New here?{' '}
          <Link className={styles.registerLink} to="/register">
            Register
          </Link>
        </p>
      </form>

    </div>
  );
}

/* ── Static data ─────────────────────────────────────── */
const stars = Array.from({ length: 30 }, () => ({
  size:     (Math.random() * 1.2 + 0.8).toFixed(1) + 'px',
  top:      (Math.random() * 55).toFixed(1) + '%',
  left:     (Math.random() * 100).toFixed(1) + '%',
  duration: (Math.random() * 3 + 2).toFixed(1) + 's',
  delay:    (Math.random() * 5).toFixed(1) + 's',
  opacity:  (Math.random() * 0.5 + 0.2).toFixed(2),
}));
