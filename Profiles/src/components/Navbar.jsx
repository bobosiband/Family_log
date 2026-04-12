import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import styles from './navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div
          className={styles.logo}
          onClick={() => navigate('/')}
        >
          Fam Logs
        </div>
        <button
          className={styles.burger}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className={`${styles.navList} ${open ? styles.open : ''}`}>
        <div className={styles.sectionTitle}>Navigation</div>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
          onClick={() => setOpen(false)}
        >
          Home
        </NavLink>

        <NavLink
          to="/browse"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
          onClick={() => setOpen(false)}
        >
          Browse Profiles
        </NavLink>

        {user && (
          <>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              onClick={() => setOpen(false)}
            >
              My Profile
            </NavLink>
            <NavLink
              to="/profile/edit"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              onClick={() => setOpen(false)}
            >
              Edit Profile
            </NavLink>
          </>
        )}

        {!user && (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              onClick={() => setOpen(false)}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              onClick={() => setOpen(false)}
            >
              Register
            </NavLink>
          </>
        )}
      </nav>

      {user && (
        <div className={styles.footer}>
          <div className={styles.profilePreview} onClick={() => navigate('/profile')}>
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt="User"
                className={styles.profileAvatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div className={styles.profileDetails}>
              <span>{user.username}</span>
              <small>Family member</small>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
