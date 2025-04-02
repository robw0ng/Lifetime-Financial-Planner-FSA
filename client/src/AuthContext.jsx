import { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("https://lifetime-financial-planner-a805aa154150.herokuapp.com/auth/session", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          login(data.user); // your existing login() function
        }
      } catch (err) {
        console.log("Not logged in");
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
