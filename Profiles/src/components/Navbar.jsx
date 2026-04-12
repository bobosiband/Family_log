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

  const closeMobileMenu = () => setOpen(false);
  const toggleMobileMenu = () => setOpen((prev) => !prev);

  return (
    <>
      <button
        className={styles.hamburgerButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation"
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div
          className={styles.mobileOverlay}
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${open ? styles.mobileOpen : ''}`}>
        <div className={styles.brand}>
          <div
            className={styles.logo}
            onClick={() => {
              navigate('/');
              closeMobileMenu();
            }}
          >
            Fam Logs
          </div>
          <button
            className={styles.closeButton}
            onClick={closeMobileMenu}
            aria-label="Close menu"
            type="button"
          >
            ✕
          </button>
        </div>

        <nav className={styles.navList}>
          <div className={styles.sectionTitle}>Navigation</div>

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/browse"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
              >
                My Profile
              </NavLink>
              <NavLink
                to="/profile/edit"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
                onClick={closeMobileMenu}
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
                onClick={closeMobileMenu}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
                onClick={closeMobileMenu}
              >
                Register
              </NavLink>
            </>
          )}
        </nav>

        {user && (
          <div className={styles.footer}>
            <div className={styles.profilePreview} onClick={() => {
              navigate('/profile');
              closeMobileMenu();
            }}>
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
            <button className={styles.logoutBtn} onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}>
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
