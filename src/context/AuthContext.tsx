import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  supabase,
  type OfficerProfile,
  type OfficerRole,
} from '../lib/supabase';

const DEMO_STORAGE_KEY = 'aicte_demo_officer_session';

interface DemoSession {
  fullName: string;
  email: string;
  role: OfficerRole;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: OfficerProfile | null;
  displayName: string;
  email: string | null;
  role: OfficerRole;
  loading: boolean;
  isAuthenticated: boolean;
  isDemoSession: boolean;
  signInAsDemo: (role?: OfficerRole, fullName?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeRole(raw: unknown): OfficerRole {
  return raw === 'evc_officer' ? 'evc_officer' : 'scrutiny_officer';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [demoSession, setDemoSession] = useState<DemoSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DemoSession) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(Boolean(supabase));

  const fetchProfile = useCallback(async (authUser: User) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          id: data.id as string,
          full_name: (data.full_name as string | null) ?? null,
          role: normalizeRole(data.role),
          created_at: data.created_at as string | undefined,
        });
      } else {
        const meta = authUser.user_metadata ?? {};
        setProfile({
          id: authUser.id,
          full_name:
            (meta.full_name as string | undefined) ||
            (meta.name as string | undefined) ||
            null,
          role: normalizeRole(meta.role),
        });
      }
    } catch {
      const meta = authUser.user_metadata ?? {};
      setProfile({
        id: authUser.id,
        full_name:
          (meta.full_name as string | undefined) ||
          (meta.name as string | undefined) ||
          null,
        role: normalizeRole(meta.role),
      });
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const currentSession = data.session ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          void fetchProfile(currentSession.user);
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (nextSession?.user) {
          void fetchProfile(nextSession.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInAsDemo = useCallback(
    (role: OfficerRole = 'scrutiny_officer', fullName = 'A. K. Verma') => {
      const next: DemoSession = {
        fullName: fullName.trim() || 'A. K. Verma',
        email:
          role === 'evc_officer'
            ? 'evc.officer@aicte-scrutiny.demo'
            : 'scrutiny.officer@aicte-scrutiny.demo',
        role,
      };
      try {
        sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors in restricted environments
      }
      setDemoSession(next);
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setDemoSession(null);
    setProfile(null);
    setSession(null);
    setUser(null);
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore network errors during sign-out so UI still clears cleanly
      }
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const meta = user?.user_metadata ?? {};
    const resolvedName =
      profile?.full_name?.trim() ||
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta.name === 'string' && meta.name.trim()) ||
      demoSession?.fullName ||
      (user?.email ? user.email.split('@')[0] : '') ||
      'A. K. Verma';

    const resolvedRole: OfficerRole = profile?.role
      ? normalizeRole(profile.role)
      : user
      ? normalizeRole(meta.role)
      : demoSession?.role ?? 'scrutiny_officer';

    return {
      session,
      user,
      profile,
      displayName: resolvedName,
      email: user?.email ?? demoSession?.email ?? null,
      role: resolvedRole,
      loading,
      isAuthenticated: Boolean(session?.user || demoSession),
      isDemoSession: Boolean(!session?.user && demoSession),
      signInAsDemo,
      signOut,
    };
  }, [session, user, profile, demoSession, loading, signInAsDemo, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
