import { createContext, useContext, useState } from 'react';

const SESSION_KEY = 'famlogs_session';

const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const persist = (user, token) => {
    const next = { user, token };
    setSession(next);
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  };

  // Called after POST /auth/login — response is { ...userFields, token }
  const login = (responseData) => {
    const { token, ...user } = responseData;
    persist(user, token);
  };

  // Called after POST /auth/register — response is { newUser, token }
  const register = (responseData) => {
    const { newUser, token } = responseData;
    persist(newUser, token);
  };

  const logout = () => {
    setSession({ user: null, token: null });
    localStorage.removeItem(SESSION_KEY);
  };

  // After a profile update the server returns the updated user object;
  // call this to sync it without touching the token.
  const refreshUser = (updatedUser) => {
    persist(updatedUser, session.token);
  };

  return (
    <AuthContext.Provider value={{ user: session.user, token: session.token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
