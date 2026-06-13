import { useState } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthCore';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('xeno_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('xeno_token'));
  const [loading] = useState(false);

  const syncAuth = (newToken, newUser) => {
    localStorage.setItem('xeno_token', newToken);
    localStorage.setItem('xeno_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    syncAuth(newToken, newUser);
    return res.data;
  };

  const register = async (email, password) => {
    const res = await api.post('/auth/register', { email, password });
    const { token: newToken, user: newUser } = res.data;
    syncAuth(newToken, newUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('xeno_token');
    localStorage.removeItem('xeno_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
