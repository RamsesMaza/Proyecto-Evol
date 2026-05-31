import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  login: (user: User, token: string) => void;
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

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch { /* ignore corrupt data */ }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, tokenStr: string) => {
    localStorage.setItem('token', tokenStr);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
    setPartialToken(null);
    setTwoFactorRequired(false);
    setTwoFactorMethod(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
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
