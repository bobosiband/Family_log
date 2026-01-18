import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Login page
 * @returns {JSX.Element}
 */
export default function Login() {
    // state for username and password
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // navigate to profile page
    const navigate = useNavigate();
    // handle submit
    const handleLogin = (e) => {
        // prevent default behavior
        e.preventDefault();
        // check if username and password are empty
        if (!username || !password) {
            alert('Please enter a username and password');
            return;
        }
        // log username and password
        console.log(username, password);
        // navigate to profile page
        navigate('/profile');
    }
    return (
      <main>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
  