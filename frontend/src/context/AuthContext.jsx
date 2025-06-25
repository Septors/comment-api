import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const accessToken = localStorage.getItem("accessToken");
    const email = localStorage.getItem("email");
    const userName = localStorage.getItem("userName");
    return accessToken ? { accessToken, email, userName } : null;
  });

  const login = ({ accessToken, email, userName }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("email", email);
    localStorage.setItem("userName", userName);
    setUser({ accessToken, email, userName });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("email");
    localStorage.removeItem("userName");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
