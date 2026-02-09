import styles from './style/Profile.module.css';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <p>Not logged in</p>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main>
      <h2>Profile</h2>

      <div className={styles.profileImageWrapper}>
        <img
          src={`http://localhost:3000${user.profilePictureUrl}`}
          alt="Profile Picture"
          className={styles.profileImage}
        />

        <button
          className={styles.editButton}
          onClick={() => navigate('/profile/edit')}
        >
          Edit
        </button>
      </div>

      <p className={styles.profileName}>
        Name: {user.name} {user.surname}
      </p>

      <p>Email: {user.email}</p>

      <p>Bio: {user.bio}</p>

      <button 
        onClick={handleLogout}
        className={styles.logoutButton}
      >
        Logout
      </button>
    </main>
  );
}
