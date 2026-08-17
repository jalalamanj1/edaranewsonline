import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, getArabicErrorMessage } from '../lib/supabase';
import { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_ADMIN_KEY = 'edara_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (isConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted) {
            if (session?.user) {
              setUser({
                id: session.user.id,
                email: session.user.email || 'admin@edara.gov.sa',
                name: session.user.user_metadata?.name || 'مشرف النظام',
              });
            } else {
              setUser(null);
            }
          }
        } catch (err) {
          console.warn('Could not fetch Supabase session:', err);
        }
      } else {
        // Local preview session check
        const stored = localStorage.getItem(LOCAL_ADMIN_KEY);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(null);
          }
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase auth state changes if configured
    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'admin@edara.gov.sa',
            name: session.user.user_metadata?.name || 'مشرف النظام',
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
    }

    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          console.warn('[Supabase Auth signIn Warning]', error.message || error);
          return { success: false, error: getArabicErrorMessage(error, 'تعذر تسجيل الدخول') };
        }

        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'مشرف النظام',
          });
          return { success: true };
        }
      } catch (err: any) {
        console.warn('[Supabase Auth signIn Catch]', err?.message || err);
        return { success: false, error: getArabicErrorMessage(err, 'تعذر الاتصال بالخادم') };
      }
    }

    // Standard preview fallback authentication
    const adminUser: AdminUser = {
      id: 'admin_1',
      email: email.trim(),
      name: email.split('@')[0] || 'مشرف النظام',
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
    return { success: true };
  };

  const signUp = async (email: string, pass: string, name?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'يجب أن لا تقل كلمة المرور عن 6 أحرف' };
    }

    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              name: name || email.split('@')[0],
            },
          },
        });

        if (error) {
          return { success: false, error: getArabicErrorMessage(error, 'تعذر إنشاء الحساب') };
        }

        if (data.session && data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || name || 'مشرف النظام',
          });
          return { success: true, message: 'تم إنشاء الحساب وتسجيل الدخول بنجاح' };
        } else if (data.user) {
          return { 
            success: true, 
            message: 'تم إرسال رابط تأكيد إلى بريدك الإلكتروني، أو يمكنك تسجيل الدخول إذا كان التأكيد التلقائي مفعلاً في Supabase' 
          };
        }
      } catch (err) {
        return { success: false, error: getArabicErrorMessage(err, 'تعذر الاتصال بالخادم') };
      }
    }

    // Local preview fallback
    const adminUser: AdminUser = {
      id: 'admin_' + Date.now(),
      email: email.trim(),
      name: name || email.split('@')[0] || 'مشرف جديد',
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
    return { success: true, message: 'تم إنشاء الحساب بنجاح' };
  };

  const signOut = async (): Promise<void> => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
