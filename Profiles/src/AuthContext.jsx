import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(
    localStorage.getItem('userId')
  );

  const login = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}