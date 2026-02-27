import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import styles from './style/Login.module.css';

/**
 * Login page
 * @returns {JSX.Element}
 */
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        console.log('LOGIN RESPONSE:', data);
        if (!response.ok) {
          alert(data.message || 'Login failed');
          return;
        }
        login(data);
        navigate('/profile');
      } catch (error) {
        console.error(error);
        alert('server not reachable');
      } finally {
        setLoading(false);
      }
  }

  return (
    <main className={styles.page}>
      <form onSubmit={handleLogin} className={styles.login}>
        <h2>Login</h2>
        <input
          type="username" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
  