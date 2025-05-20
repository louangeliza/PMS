// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, getProfile } from '../services/authService';
import { User } from '../types';
import { setToken, getToken, clearToken } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (token) {
          const profile = await getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        clearToken();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const loginHandler = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const registerHandler = async (data: { name: string; email: string; password: string; role?: string }) => {
    try {
      const response = await register(data);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logoutHandler = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: loginHandler, register: registerHandler, logout: logoutHandler, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
