import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { signin as apiSignin, signup as apiSignup } from '../services/authService';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'dayflow_token';
const USER_KEY  = 'dayflow_user';

function parseUser(raw) {
  try { return JSON.parse(raw); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(() => parseUser(localStorage.getItem(USER_KEY)));
  const [token,         setToken]         = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading,       setLoading]       = useState(false);
  const [initialising,  setInitialising]  = useState(true);

  // On mount — verify stored state is still consistent
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = parseUser(localStorage.getItem(USER_KEY));
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      setToken(null);
      setUser(null);
    }
    setInitialising(false);
  }, []);

  // Listen for 401 events emitted by the Axios interceptor
  useEffect(() => {
    const handle = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('dayflow:unauthorized', handle);
    return () => window.removeEventListener('dayflow:unauthorized', handle);
  }, []);

  const persistSession = useCallback((userData, jwtToken) => {
    localStorage.setItem(TOKEN_KEY, jwtToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await apiSignin({ email, password });
      // Normalise response — backend may return { token, user } or { token, data }
      const jwt      = data.token || data.accessToken;
      const userData = data.user  || data.data  || data.employee || {};
      persistSession(userData, jwt);
      return { success: true, user: userData };
    } finally {
      setLoading(false);
    }
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const data = await apiSignup({ name, email, password });
      return { success: true, data };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    initialising,
    login,
    register,
    logout,
    /**
     * Call this after a successful profile update so the nav reflects changes.
     */
    refreshUser: (updatedUser) => {
      const merged = { ...user, ...updatedUser };
      setUser(merged);
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
    },
  }), [user, token, loading, initialising, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
