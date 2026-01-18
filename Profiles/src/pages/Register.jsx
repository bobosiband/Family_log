import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    // state for full name, email, password and confirm password
    const [Name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // navigate to profile page
    const navigate = useNavigate();
    // handle submit
    const handleRegister = (e) => {
        e.preventDefault();
        if (!Name || !surname || !username || !email || !password || !confirmPassword) {
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
        // log full name, surname, username, email, password and confirm password
        console.log(Name, surname, username, email, password, confirmPassword);
        // navigate to profile page
        navigate('/profile');
    }

    return (
      <main>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Name" 
            value={Name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Surname" 
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit">Register</button>
        </form>
      </main>
    );
  }
  