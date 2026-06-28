import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('njobs_token');
      const cachedUser = localStorage.getItem('njobs_user');

      if (!token) {
        setLoading(false);
        return;
      }

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          
        }
      }

      try {
        const { user: freshUser } = await authService.getMe();
        setUser(freshUser);
        localStorage.setItem('njobs_user', JSON.stringify(freshUser));
      } catch {
        localStorage.removeItem('njobs_token');
        localStorage.removeItem('njobs_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('njobs_token', data.token);
    localStorage.setItem('njobs_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem('njobs_token', data.token);
    localStorage.setItem('njobs_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const googleLogin = useCallback(async (credential, role) => {
    const data = await authService.googleLogin(credential, role);
    localStorage.setItem('njobs_token', data.token);
    localStorage.setItem('njobs_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('njobs_token');
    localStorage.removeItem('njobs_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('njobs_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        isApplicant: user?.role === 'applicant',
        isEmployer: user?.role === 'employer',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
