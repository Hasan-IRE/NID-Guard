import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { AuthService, ROLE_PERMISSIONS } from '../services/authService';
import { DEMO_USERS } from '../data/demoData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS['admin']) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session or auto-login with admin demo account for initial presentation
    const saved = AuthService.getSavedSession();
    if (saved) {
      setUser(saved.user);
    } else {
      // Default to demo admin for instant prototype preview
      const defaultUser = DEMO_USERS['admin'].user;
      AuthService.saveSession(defaultUser, 'demo-admin-token');
      setUser(defaultUser);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const res = await AuthService.login(username, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      return true;
    }
    throw new Error(res.error || 'Authentication failed');
  };

  const demoLogin = async (role: UserRole) => {
    const userKey = role === 'admin' ? 'admin' : role === 'security' ? 'security' : role === 'operator' ? 'operator' : 'viewer';
    const account = DEMO_USERS[userKey];
    if (account) {
      AuthService.saveSession(account.user, `demo-token-${userKey}`);
      setUser(account.user);
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS['admin']): boolean => {
    if (!user) return false;
    return AuthService.hasPermission(user.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        demoLogin,
        logout,
        hasPermission,
        loading,
      }}
    >
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
