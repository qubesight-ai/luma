import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManager } from '@/hooks/useSessionManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sessionValid: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);

  const { registerSession, removeSession, clearLocalSession, checkSession } = useSessionManager(user?.id);

  // Session validation is now disabled since we removed device limits
  // Admin can manually terminate sessions from the admin panel if needed
  // This prevents false-positive session invalidation issues

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register session when user changes (after sign in) - skip for demo user
  useEffect(() => {
    if (user && user.email !== 'qubetest@tutamail.com') {
      registerSession();
    }
  }, [user, registerSession]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: displayName || email.split('@')[0]
        }
      }
    });

    // If signup successful, update the profile and send admin notification
    if (!error && data.user) {
      const userId = data.user.id;
      const userName = displayName || email.split('@')[0];
      
      // Update profile with display name
      setTimeout(async () => {
        await supabase
          .from('profiles')
          .update({ display_name: userName })
          .eq('user_id', userId);
      }, 100);

      // Send signup notification to admin (fire and forget)
      const adminUrl = `${window.location.origin}/admin/users`;
      supabase.functions.invoke('send-signup-notification', {
        body: {
          userEmail: email,
          displayName: userName,
          signupTime: new Date().toISOString(),
          adminUrl: adminUrl,
        },
      }).catch((err) => {
        console.error('Failed to send signup notification:', err);
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      setSessionValid(true);
    }
    
    return { error };
  };

  const signOut = async () => {
    await removeSession();
    clearLocalSession();
    await supabase.auth.signOut();
    setSessionValid(true);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, sessionValid, signUp, signIn, signOut }}>
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
