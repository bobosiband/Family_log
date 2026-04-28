import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState, useEffect } from 'react';
import styles from './navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchUnreadCount() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${user.id}/messages`);
        const data = await response.json();
        if (data.inbox) {
          setUnreadCount(data.inbox.filter(m => !m.read).length);
        }
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);
  
  // TODO: replace polling with Socket.IO

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
                to="/messages"
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
                onClick={closeMobileMenu}
              >
                Messages {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
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
