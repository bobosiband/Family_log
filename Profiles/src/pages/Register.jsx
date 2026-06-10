import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import styles from './style/Register.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('error');

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !surname || !username || !email || !password || !confirmPassword) {
      setStatusType('error');
      setStatusMessage('Please fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      setStatusType('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setStatusType('error');
      setStatusMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    setStatusMessage('');
    try {
      const data = await api.post('/auth/register', { name, surname, username, email, password });
      register(data);
      navigate('/profile');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error.message || 'Registration failed. Please try again.');
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

      <form onSubmit={handleRegister} className={styles.card}>
        <div className={styles.header}>
          <p className={styles.kicker}>FamLogs</p>
          <h2 className={styles.title}>Create account</h2>
          <p className={styles.subtitle}>Join the family space and start adding your story.</p>
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Surname</label>
            <input
              className={styles.input}
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              disabled={loading}
            />
          </div>
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
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confirm Password</label>
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <motion.button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02, y: -2 }}
          whileTap={loading ? {} : { scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>

        {statusMessage && (
          <div className={`${styles.statusMessage} ${styles[statusType]}`} role="status" aria-live="polite">
            {statusMessage}
          </div>
        )}

        <p className={styles.loginText}>
          Already have an account?{' '}
          <Link className={styles.loginLink} to="/login">
            Log in
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
