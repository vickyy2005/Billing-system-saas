'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({}),
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function initAuth() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        if (url && !url.includes('placeholder.supabase.co')) {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            setUser({ id: data.user.id, email: data.user.email || '' });
          } else {
            // Check local session fallback if any
            checkLocalSession();
          }
        } else {
          checkLocalSession();
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        checkLocalSession();
      } finally {
        setLoading(false);
      }
    }

    function checkLocalSession() {
      const savedUser = localStorage.getItem('billing_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default local admin session for smooth testing
        const defaultUser = { id: 'admin-user-001', email: 'admin@shrinivasenterprise.com' };
        localStorage.setItem('billing_user', JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (url && !url.includes('placeholder.supabase.co')) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) {
          return { error: error.message };
        }
        if (data.user) {
          const u = { id: data.user.id, email: data.user.email || email };
          setUser(u);
          localStorage.setItem('billing_user', JSON.stringify(u));
          return {};
        }
      }

      // Fallback local auth validation
      if (!email || !pass) {
        return { error: 'Please enter both email and password' };
      }

      const u = { id: 'admin-user-001', email };
      setUser(u);
      localStorage.setItem('billing_user', JSON.stringify(u));
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (url && !url.includes('placeholder.supabase.co')) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('billing_user');
      router.push('/login');
    }
  };

  // Route protection
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
