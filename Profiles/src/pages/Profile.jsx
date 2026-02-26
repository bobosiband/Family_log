import styles from './style/Profile.module.css';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const capitalizeFirstWord = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (!user) {
    return <p>Not logged in</p>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.profileImageWrapper}>
            {user.profilePictureUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${user.profilePictureUrl}`}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.placeholder}>No Image</div>
            )}
          </div>

          <h2 className={styles.fullName}>
            {capitalizeFirstWord(user.name)} {capitalizeFirstWord(user.surname)}
          </h2>

          <p className={styles.username}>@{user.username}</p>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span>Email</span>
            <p>{user.email}</p>
          </div>

          <div className={styles.bioSection}>
            <h4>Bio</h4>
            <p>{user.bio || "No bio added yet."}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
