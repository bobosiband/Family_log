import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import styles from './style/Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter a username and password');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }
      login(data);
      navigate('/profile');
    } catch (error) {
      console.error(error);
      alert('Server not reachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* Sky layers */}
      <div className={styles.sky} />
      <div className={styles.moon} />
      <div className={styles.moonGlow} />

      {/* Stars */}
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
          }}
        />
      ))}

      {/* Mountains */}
      <svg className={styles.mountainBack} viewBox="0 0 800 300" preserveAspectRatio="none">
        <polygon points="0,300 120,80 240,200 360,60 480,180 600,40 720,160 800,100 800,300" fill="#4a2060" />
      </svg>
      <svg className={styles.mountainMid} viewBox="0 0 800 260" preserveAspectRatio="none">
        <polygon points="0,260 100,100 200,180 320,50 440,160 560,70 680,140 800,80 800,260" fill="#5c1a6b" />
      </svg>

      {/* Clouds */}
      <div className={`${styles.cloud} ${styles.cloud1}`} />
      <div className={`${styles.cloud} ${styles.cloud2}`} />
      <div className={`${styles.cloud} ${styles.cloud3}`} />

      {/* Trees */}
      <svg className={styles.trees} viewBox="0 0 800 220" preserveAspectRatio="none">
        {treeData.map((t, i) => (
          <g key={i} transform={`translate(${t.x},${220 - t.h})`}>
            <polygon points={`0,${t.h} ${t.w / 2},0 ${t.w},${t.h}`} fill={t.color} />
            <polygon
              points={`${t.w * 0.28},${t.h * 0.28} ${t.w / 2},0 ${t.w * 0.72},${t.h * 0.28}`}
              fill="rgba(220,240,255,0.85)"
            />
          </g>
        ))}
      </svg>

      {/* Snow ground */}
      <div className={styles.snowGround} />
      <div className={styles.snowGround2} />

      {/* Card */}
      <form onSubmit={handleLogin} className={styles.card}>
        <h2 className={styles.title}>Login</h2>

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
          <input
            className={styles.input}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
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
          <button
            type="button"
            className={styles.forgotBtn}
            onClick={() => setShowPassword((p) => !p)}
          >
            {showPassword ? 'Hide Password' : 'Show Password'}
          </button>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className={styles.registerText}>
          Don't have a account{' '}
          <span className={styles.registerLink} onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
      </form>

    </div>
  );
}

/* ── Static data ─────────────────────────────────────── */
const stars = Array.from({ length: 45 }, () => ({
  size:     (Math.random() * 2.5 + 1).toFixed(1) + 'px',
  top:      (Math.random() * 55).toFixed(1) + '%',
  left:     (Math.random() * 100).toFixed(1) + '%',
  duration: (Math.random() * 3 + 2).toFixed(1) + 's',
  delay:    (Math.random() * 5).toFixed(1) + 's',
}));

const treeData = [
  { x: 0,   h: 160, w: 55, color: '#1a3a5c' },
  { x: 30,  h: 200, w: 65, color: '#1e4a6e' },
  { x: 70,  h: 140, w: 50, color: '#153050' },
  { x: 105, h: 180, w: 60, color: '#1a3a5c' },
  { x: 140, h: 120, w: 45, color: '#1e4a6e' },
  { x: 570, h: 130, w: 48, color: '#153050' },
  { x: 605, h: 175, w: 62, color: '#1a3a5c' },
  { x: 645, h: 150, w: 55, color: '#1e4a6e' },
  { x: 682, h: 195, w: 65, color: '#153050' },
  { x: 722, h: 120, w: 45, color: '#1a3a5c' },
  { x: 752, h: 160, w: 55, color: '#1e4a6e' },
];
