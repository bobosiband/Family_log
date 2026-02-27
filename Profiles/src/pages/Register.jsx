import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import styles from './style/Register.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !surname || !username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    if (!email.includes('@')) {
        alert('Please enter a valid email');
        setEmail('');
        return;
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        setPassword('');
        setConfirmPassword('');
        return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        return;
      }
      login(data.newUser); 
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
      <form onSubmit={handleRegister} className={styles.register}>
        <h2>Register</h2>
        <input 
          type="text" 
          placeholder="Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <input 
          type="text" 
          placeholder="Surname" 
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          disabled={loading}
        />
        <input 
          type="text" 
          placeholder="Username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </main>
  );
}