'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EchoUser, EchoBillingInfo } from '@/utils/echoAuth';

interface AuthContextType {
  user: EchoUser | null;
  billingInfo: EchoBillingInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => void;
  refreshBilling: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EchoUser | null>(null);
  const [billingInfo, setBillingInfo] = useState<EchoBillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('echo_token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        await refreshBilling();
      } else {
        localStorage.removeItem('echo_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('echo_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('echo_token', data.token);
        await refreshBilling();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('echo_token', data.token);
        await refreshBilling();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    setBillingInfo(null);
    localStorage.removeItem('echo_token');
  };

  const refreshBilling = async () => {
    const token = localStorage.getItem('echo_token');
    if (!token || !user) return;

    try {
      const response = await fetch('/api/billing/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBillingInfo(data.billing);
      }
    } catch (error) {
      console.error('Failed to refresh billing info:', error);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    const token = localStorage.getItem('echo_token');
    if (!token || !user) return false;

    try {
      const response = await fetch('/api/auth/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Clear all local state
        setUser(null);
        setBillingInfo(null);
        localStorage.removeItem('echo_token');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        billingInfo,
        loading,
        signIn,
        signUp,
        signOut,
        refreshBilling,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
