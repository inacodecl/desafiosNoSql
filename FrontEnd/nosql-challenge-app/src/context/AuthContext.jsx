import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    const token  = localStorage.getItem('token');
    if (stored && token) {
      try { setUsuario(JSON.parse(stored)); }
      catch { localStorage.clear(); }
    }
    setLoading(false);
  }, []);

  const login = async (correo) => {
    const res = await authAPI.login(correo);
    const { token, usuario: u } = res.data;
    localStorage.setItem('token',   token);
    localStorage.setItem('usuario', JSON.stringify(u));
    setUsuario(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}