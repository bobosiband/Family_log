import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import styles from './style/Login.module.css';

/**
 * Login page
 * @returns {JSX.Element}
 */
export default function Login() {
    // state for username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // get user from auth context
    const { login } = useAuth();
    // navigate to profile page
    const navigate = useNavigate();
    // handle submit
    const handleLogin = async (e) => {
        // prevent default behavior
        e.preventDefault();
        // check if username and password are empty
        if (!username || !password) {
            alert('Please enter a username and password');
            return;
        }
        try {
          // send login request to backend 
          const response = await fetch('http://localhost:3000/auth/login', {
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
          // call login function from auth context
          login(data);
           // navigate to profile page
          navigate('/profile');

        } catch (error) {
          console.error(error);
          alert('server not reachable')
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
           />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </main>
    );
  }
  