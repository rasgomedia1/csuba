import React, { createContext, useState } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  user_plan?: 'free' | 'donor';
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read the stored session synchronously so the first render already knows
// whether the user is logged in (avoids a double search and a login flash).
function loadSession(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) return { token, user: JSON.parse(user) };
  } catch {
    localStorage.removeItem('user');
  }
  return { token: null, user: null };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session] = useState(loadSession);
  const [user, setUser] = useState<User | null>(session.user);
  const [token, setToken] = useState<string | null>(session.token);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
