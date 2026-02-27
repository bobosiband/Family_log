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
    <nav className={styles.nav}>
      <div className={styles.container}>

        <h2 
          className={styles.logo}
          onClick={() => navigate('/')}
        >
          Fam Logs
        </h2>

        <div className={styles.links}>

          <NavLink to="/" className={styles.link}>
            Home
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={styles.link}>
                Login
              </NavLink>
              <NavLink to="/register" className={styles.link}>
                Register
              </NavLink>
            </>
          )}

          {user && (
            <div className={styles.profileSection}>
              
              <div 
                className={styles.avatarWrapper}
                onClick={() => setOpen(!open)}
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt="avatar"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {open && (
                <div className={styles.dropdown}>
                  <button onClick={() => navigate('/profile')}>
                    Profile
                  </button>
                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
