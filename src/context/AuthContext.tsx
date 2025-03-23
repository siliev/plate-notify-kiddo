
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user - In a real app, this would be verified against a backend
const MOCK_ADMIN = {
  id: '1',
  username: 'admin',
  password: 'admin123', // In a real app, passwords would NEVER be stored like this
  isAdmin: true
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (from localStorage in this demo)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // In a real app, this would be an API call to verify credentials
      if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
        const userData = {
          id: MOCK_ADMIN.id,
          username: MOCK_ADMIN.username,
          isAdmin: MOCK_ADMIN.isAdmin
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
