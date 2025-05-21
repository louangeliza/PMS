import { useState, useEffect } from 'react';
import { login, register, getProfile } from '../services/authService';
import { User, UserRole } from '../types';
import { setToken, getToken, clearToken } from '../utils/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getToken();
        console.log('Initial auth check - token exists:', !!token);
        if (token) {
          console.log('Fetching user profile...');
          const profile = await getProfile();
          console.log('Profile fetched:', profile);
          if (profile && profile.id && profile.email && profile.role) {
            setUser(profile);
          } else {
            console.error('Invalid profile data, clearing token');
            clearToken();
            setUser(null);
          }
        } else {
          console.log('No token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        clearToken();
        setUser(null);
      } finally {
        console.log('Auth loading complete');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginHandler = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });
      console.log('Login response:', response);

      const authToken = response.token || response.accessToken || response.data?.token;
      if (!authToken) {
        throw new Error('Authentication token missing in response');
      }

      setToken(authToken);

      let userData = response.user || response.data?.user;
      if (!userData) {
        console.log('User data not in login response, fetching profile...');
        userData = await getProfile();
      }

      if (!userData || !userData.email) {
        throw new Error('User data incomplete');
      }

      const user: User = {
        id: userData.id || userData._id,
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: userData.updated_at || new Date().toISOString(),
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        role: (userData.role as UserRole) || 'client',
      };

      setUser(user);
      return { user, token: authToken };
    } catch (error) {
      console.error('Login error:', error);
      clearToken();
      setUser(null);
      throw error instanceof Error ? error : new Error('Login failed');
    }
  };

  const registerHandler = async (data: { firstname: string; lastname: string; email: string; password: string; role?: string }) => {
    try {
      const response = await register(data);
      if (!response.user || !response.token) {
        throw new Error('Invalid register response: Missing user or token');
      }
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logoutHandler = () => {
    clearToken();
    setUser(null);
  };

  return { user, login: loginHandler, register: registerHandler, logout: logoutHandler, loading };
}