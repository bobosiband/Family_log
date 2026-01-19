import styles from './style/Profile.module.css';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
/**
 * Profile page
 * @returns {JSX.Element}
*/

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
    return (
      <main>
        <h2>Profile</h2>
        <br />
        <img 
        src="/src/assets/images/bongani.jpg" 
        alt="Profile Picture" 
        className={styles.profileImage}
        />
        <p className={styles.profileName}>Name: Bongani Sibanda</p>
        <p>Email: bongani@gmail.com</p>
        <p>Bio: All good children touch good carbons.</p>
        <br />
        <button onClick={handleLogout}>logout</button>
      </main>
    );
  }