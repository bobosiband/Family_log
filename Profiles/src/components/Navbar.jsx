import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../lib/api';
import { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function fetchUnreadCount() {
      try {
        const userId = user.id || user._id || user.userId;
        const data = await api.get(`/users/${userId}/messages`);
        if (data.inbox) {
          setUnreadCount(data.inbox.filter(m => !m.read).length);
        }
      } catch {
        // silent
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setOpen(false);
  const toggleMobileMenu = () => setOpen((prev) => !prev);

  return (
    <>
      <motion.button
        className={styles.hamburgerButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation"
        type="button"
        whileTap={{ scale: 0.92 }}
      >
        <span />
        <span />
        <span />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.mobileOverlay}
            onClick={closeMobileMenu}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <aside className={`${styles.sidebar} ${open ? styles.mobileOpen : ''}`}>
        <div className={styles.brand}>
          <button
            className={styles.logoBtn}
            onClick={() => { navigate('/'); closeMobileMenu(); }}
            type="button"
          >
            FamLogs
          </button>
          <button
            className={styles.closeButton}
            onClick={closeMobileMenu}
            aria-label="Close menu"
            type="button"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <nav className={styles.navList}>
          <div className={styles.sectionTitle}>Navigation</div>

          <NavLink
            to="/"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/browse"
            className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
            onClick={closeMobileMenu}
          >
            Browse Profiles
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                onClick={closeMobileMenu}
              >
                My Profile
              </NavLink>
              <NavLink
                to="/messages"
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                onClick={closeMobileMenu}
              >
                Messages
                {unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount}</span>
                )}
              </NavLink>
              <NavLink
                to="/profile/edit"
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
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
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                onClick={closeMobileMenu}
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                onClick={closeMobileMenu}
              >
                Register
              </NavLink>
            </>
          )}
        </nav>

        {user && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.profilePreview}
              onClick={() => { navigate('/profile'); closeMobileMenu(); }}
            >
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.username}
                  className={styles.profileAvatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {(user.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className={styles.profileDetails}>
                <span>{user.username}</span>
                <small>Family member</small>
              </div>
            </button>
            <motion.button
              type="button"
              className={styles.logoutBtn}
              onClick={() => { handleLogout(); closeMobileMenu(); }}
              whileHover={{ scale: 1.02, filter: 'brightness(1.06)' }}
              whileTap={{ scale: 0.97 }}
            >
              Log out
            </motion.button>
          </div>
        )}
      </aside>
    </>
  );
}
