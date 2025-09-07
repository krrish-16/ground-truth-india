// Authentication hook with mock implementation
// TODO: Replace with real authentication system (FastAPI + JWT or Supabase)

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/data/structuredMockData';
import { apiService } from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Check for existing session/token on app start
    const savedUser = localStorage.getItem('dwlr_user');
    const savedToken = localStorage.getItem('dwlr_token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      
      if (response) {
        setUser(response.user);
        localStorage.setItem('dwlr_user', JSON.stringify(response.user));
        localStorage.setItem('dwlr_token', response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(email, password, name);
      
      if (response) {
        setUser(response.user);
        localStorage.setItem('dwlr_user', JSON.stringify(response.user));
        localStorage.setItem('dwlr_token', response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dwlr_user');
    localStorage.removeItem('dwlr_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};