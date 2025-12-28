'use client';

import { useState, useCallback, useEffect } from 'react';
import ApiService from '@/services/api';
import { logger } from '@/utils/logger';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  username: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const hasAuthCookie = ApiService.isAuthenticated();
      
      if (!hasAuthCookie) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        return false;
      }

      const userProfile = await ApiService.getProfile();
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      logger.info('Auth check successful', { user: userProfile?.email });
      return true;
    } catch (error) {
      logger.error('Auth check failed', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      ApiService.clearAuthState();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await ApiService.login(email, password);
      const userProfile = await ApiService.getProfile();
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      logger.info('Login successful', { user: email });
      toast.success('Welcome back!');
      return true;
    } catch (error: any) {
      logger.error('Login failed', error);
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await ApiService.register(email, password, username);
      const userProfile = await ApiService.getProfile();
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      logger.info('Registration successful', { user: email });
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      logger.error('Registration failed', error);
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await ApiService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      logger.info('Logout successful');
      toast.success('Logged out successfully');
    } catch (error) {
      logger.error('Logout error', error);
      toast.error('Logout failed');
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    register,
    logout,
    checkAuth,
  };
}

export default useAuth;
