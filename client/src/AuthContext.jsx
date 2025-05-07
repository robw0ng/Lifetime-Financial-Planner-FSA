import { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    console.log('logging out');
    setUser(null);
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/session`,
          {
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          login(data.user); // your existing login() function
        }
      } catch (err) {
        console.log('Not logged in');
      }
    };

    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
