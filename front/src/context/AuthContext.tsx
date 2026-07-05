import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { setAccessToken } from '../services/httpClient';
import { refreshToken as refreshApi, logout as logoutApi } from '../services/authApi';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  partialToken: string | null;
  twoFactorRequired: boolean;
  twoFactorMethod: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setTwoFactorChallenge: (partialToken: string, method: string) => void;
  clearTwoFactorChallenge: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [partialToken, setPartialToken] = useState<string | null>(null);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);

  // On mount, try to restore session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch { /* ignore corrupt data */ }
      setLoading(false);
    } else if (storedUser) {
      // No access token but has user data — might still have a valid cookie refresh token
      refreshApi().then(result => {
        setAccessToken(result.accessToken);
        setToken(result.accessToken);
        try {
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
        } catch { /* ignore */ }
      }).catch(() => {
        localStorage.removeItem('user');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData: User, tokenStr: string) => {
    setAccessToken(tokenStr);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
    setPartialToken(null);
    setTwoFactorRequired(false);
    setTwoFactorMethod(null);
  };

  const logout = () => {
    logoutApi().catch(() => {}); // Best-effort server-side logout
    setAccessToken(null);
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPartialToken(null);
    setTwoFactorRequired(false);
    setTwoFactorMethod(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const setTwoFactorChallenge = (partialTokenVal: string, method: string) => {
    setPartialToken(partialTokenVal);
    setTwoFactorRequired(true);
    setTwoFactorMethod(method);
  };

  const clearTwoFactorChallenge = () => {
    setPartialToken(null);
    setTwoFactorRequired(false);
    setTwoFactorMethod(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, loading,
      partialToken, twoFactorRequired, twoFactorMethod,
      login, logout, updateUser, setTwoFactorChallenge, clearTwoFactorChallenge,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
