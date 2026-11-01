import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon,
  WifiOff,
} from 'lucide-react';
import { isSupabaseConfigured, supabase, type OfficerRole } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { FadeUpOnMount } from '../../motion/wrappers';

function formatAuthError(err: unknown): { title: string; detail: string; isOffline: boolean } {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      title: 'Network connection offline',
      detail:
        'Your device appears to be offline. Reconnect to the internet to authenticate with Supabase, or continue with a local Demo Officer session below.',
      isOffline: true,
    };
  }
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
      ? err
      : 'Authentication request failed.';

  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return {
      title: 'Unable to reach authentication server',
      detail:
        'A network error prevented connecting to Supabase Auth. Check your internet connection or use the Demo Officer session below.',
      isOffline: true,
    };
  }
  if (/invalid login credentials/i.test(msg)) {
    return {
      title: 'Invalid email or password',
      detail:
        'No officer account matched that email and password combination. Verify your credentials or create a new officer account.',
      isOffline: false,
    };
  }
  if (/email not confirmed/i.test(msg)) {
    return {
      title: 'Email confirmation required',
      detail:
        'Please open the verification link sent to your email inbox before signing in.',
      isOffline: false,
    };
  }
  return {
    title: 'Authentication notice',
    detail: msg,
    isOffline: false,
  };
}

const GoogleMarkSvg: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.04-4.38 3.04-7.51 0-.72-.06-1.42-.19-2H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.3-2.56c-.91.61-2.08.98-3.32.98-2.55 0-4.72-1.72-5.49-4.04H3.1v2.64A9.99 9.99 0 0 0 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M6.51 13.96A6.01 6.01 0 0 1 6.19 12c0-.68.12-1.34.32-1.96V7.4H3.1A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.1 4.6l3.41-2.64z"
    />
    <path
      fill="#FBBC05"
      d="M12 5.98c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 3.01 14.7 2 12 2A9.99 9.99 0 0 0 3.1 7.4l3.41 2.64C7.28 7.7 9.45 5.98 12 5.98z"
    />
  </svg>
);

const AuthShell: React.FC<{
  mode: 'signin' | 'signup';
  children: React.ReactNode;
}> = ({ mode, children }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-navy-900 text-white safe-top safe-bottom">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-navy-900/95 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-lg py-1 min-w-0"
          >
            <Logo variant="mark" size={32} animated={false} theme="dark" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm sm:text-base text-white tracking-tight truncate">
                AICTE Scrutiny &amp; Compliance Portal
              </span>
              <span className="font-mono text-[10px] text-teal-400 tracking-[0.14em] uppercase truncate">
                OFFICER AUTHENTICATION GATEWAY
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 bg-navy-800/70 transition-colors duration-150 shrink-0 tactile-press"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-6">
          <FadeUpOnMount>
            <div className="bg-navy-800/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                  <span>
                    {mode === 'signin'
                      ? 'STATUTORY OFFICER SIGN-IN'
                      : 'NEW OFFICER REGISTRATION'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {mode === 'signin'
                    ? 'Sign in to Scrutiny Workspace'
                    : 'Create Officer Account'}
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {mode === 'signin'
                    ? 'Authenticate with your AICTE Scrutiny or EVC Officer credentials to inspect institutional dossiers.'
                    : 'Register as a Scrutiny Officer or Expert Visit Committee (EVC) Officer. Your role is stored in your Supabase profile.'}
                </p>
              </div>

              {children}
            </div>
          </FadeUpOnMount>
        </div>
      </main>
    </div>
  );
};

export const SignInPage: React.FC = () => {
  const { isAuthenticated, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    title: string;
    detail: string;
    isOffline: boolean;
  } | null>(null);

  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorInfo({
        title: 'Missing credentials',
        detail: 'Please enter both your officer email address and password.',
        isOffline: false,
      });
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      signInAsDemo('scrutiny_officer', cleanEmail.split('@')[0] || 'A. K. Verma');
      navigate('/app', { replace: true });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        setErrorInfo(formatAuthError(error));
        return;
      }
      navigate(fromPath, { replace: true });
    } catch (err) {
      setErrorInfo(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorInfo(null);
    if (!supabase || !isSupabaseConfigured) {
      setErrorInfo({
        title: 'Supabase env not configured locally',
        detail:
          'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to use Google OAuth, or use the Demo Officer session below.',
        isOffline: false,
      });
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorInfo(formatAuthError(new Error('Failed to fetch')));
      return;
    }
    setGoogleSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) {
        setErrorInfo(formatAuthError(error));
        setGoogleSubmitting(false);
      }
    } catch (err) {
      setErrorInfo(formatAuthError(err));
      setGoogleSubmitting(false);
    }
  };

  const handleDemoLaunch = (role: OfficerRole) => {
    signInAsDemo(
      role,
      role === 'evc_officer' ? 'Dr. R. K. Nair (EVC)' : 'A. K. Verma'
    );
    navigate('/app', { replace: true });
  };

  return (
    <AuthShell mode="signin">
      {errorInfo && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-950/60 p-3.5 text-xs text-red-100 flex items-start gap-2.5"
        >
          {errorInfo.isOffline ? (
            <WifiOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 space-y-0.5 [overflow-wrap:anywhere]">
            <p className="font-semibold text-white">{errorInfo.title}</p>
            <p className="text-red-200 leading-relaxed">{errorInfo.detail}</p>
          </div>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        disabled={googleSubmitting || submitting}
        onClick={handleGoogleSignIn}
        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors duration-150 disabled:opacity-50 tactile-press"
      >
        <GoogleMarkSvg />
        <span>
          {googleSubmitting ? 'Redirecting to Google...' : 'Continue with Google'}
        </span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-700/80 w-full" />
        <span className="bg-navy-800 px-3 font-mono text-[10px] uppercase tracking-widest text-slate-400 shrink-0">
          OR EMAIL CREDENTIALS
        </span>
        <div className="border-t border-slate-700/80 w-full" />
      </div>

      <form onSubmit={handleEmailSignIn} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="signin-email"
            className="block text-xs font-medium text-slate-300"
          >
            Officer Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signin-email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              enterKeyHint="next"
              maxLength={254}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@aicte-india.org"
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signin-password"
            className="block text-xs font-medium text-slate-300"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              enterKeyHint="go"
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || googleSubmitting}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal text-navy-900 hover:bg-teal-400 font-semibold text-sm flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 tactile-press"
        >
          <span>{submitting ? 'Signing in...' : 'Sign in to Portal'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Instant Demo Session Bypass for SIH Evaluators / Offline Testing */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
          SIH 2026 EVALUATOR QUICK ACCESS (SYNTHETIC SESSION)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLaunch('scrutiny_officer')}
            className="min-h-[40px] px-3 py-2 rounded-lg border border-slate-700 hover:border-teal/50 bg-navy-900/80 text-xs font-medium text-slate-200 hover:text-white transition-colors duration-150 tactile-press"
          >
            Demo Scrutiny Officer
          </button>
          <button
            type="button"
            onClick={() => handleDemoLaunch('evc_officer')}
            className="min-h-[40px] px-3 py-2 rounded-lg border border-slate-700 hover:border-teal/50 bg-navy-900/80 text-xs font-medium text-slate-200 hover:text-white transition-colors duration-150 tactile-press"
          >
            Demo EVC Officer
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center pt-1">
        Don&apos;t have an officer account?{' '}
        <Link
          to="/signup"
          className="text-teal-400 hover:text-teal-300 font-semibold underline"
        >
          Create account
        </Link>
      </p>
    </AuthShell>
  );
};

export const SignUpPage: React.FC = () => {
  const { isAuthenticated, signInAsDemo } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<OfficerRole>('scrutiny_officer');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{
    title: string;
    detail: string;
    isOffline: boolean;
  } | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorInfo({
        title: 'Full name required',
        detail: 'Please enter your official name for the scrutiny audit log.',
        isOffline: false,
      });
      return;
    }
    if (!cleanEmail || !password || password.length < 6) {
      setErrorInfo({
        title: 'Invalid email or password',
        detail: 'Provide a valid email address and a password of at least 6 characters.',
        isOffline: false,
      });
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      signInAsDemo(role, cleanName);
      navigate('/app', { replace: true });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role,
          },
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (error) {
        setErrorInfo(formatAuthError(error));
        return;
      }

      if (data.session) {
        navigate('/app', { replace: true });
      } else {
        setConfirmationSentTo(cleanEmail);
      }
    } catch (err) {
      setErrorInfo(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorInfo(null);
    if (!supabase || !isSupabaseConfigured) {
      signInAsDemo(role, fullName.trim() || 'A. K. Verma');
      navigate('/app', { replace: true });
      return;
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorInfo(formatAuthError(new Error('Failed to fetch')));
      return;
    }
    setGoogleSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) {
        setErrorInfo(formatAuthError(error));
        setGoogleSubmitting(false);
      }
    } catch (err) {
      setErrorInfo(formatAuthError(err));
      setGoogleSubmitting(false);
    }
  };

  return (
    <AuthShell mode="signup">
      {confirmationSentTo ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Verification email sent</span>
          </div>
          <p className="text-slate-200 leading-relaxed [overflow-wrap:anywhere]">
            We sent a confirmation link to{' '}
            <strong className="font-mono text-white">{confirmationSentTo}</strong>.
            Click the link in your email to activate your{' '}
            <span className="font-mono text-teal-300">
              {role === 'evc_officer' ? 'EVC OFFICER' : 'SCRUTINY OFFICER'}
            </span>{' '}
            profile, then sign in.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <Link
              to="/signin"
              className="min-h-[40px] px-4 py-2 rounded-lg bg-teal text-navy-900 font-semibold inline-flex items-center gap-1.5 tactile-press"
            >
              <span>Proceed to Sign in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {errorInfo && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-950/60 p-3.5 text-xs text-red-100 flex items-start gap-2.5"
            >
              {errorInfo.isOffline ? (
                <WifiOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 space-y-0.5 [overflow-wrap:anywhere]">
                <p className="font-semibold text-white">{errorInfo.title}</p>
                <p className="text-red-200 leading-relaxed">{errorInfo.detail}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={googleSubmitting || submitting}
            onClick={handleGoogleSignUp}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors duration-150 disabled:opacity-50 tactile-press"
          >
            <GoogleMarkSvg />
            <span>
              {googleSubmitting
                ? 'Redirecting to Google...'
                : 'Continue with Google'}
            </span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700/80 w-full" />
            <span className="bg-navy-800 px-3 font-mono text-[10px] uppercase tracking-widest text-slate-400 shrink-0">
              OR REGISTER WITH EMAIL
            </span>
            <div className="border-t border-slate-700/80 w-full" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="signup-name"
                className="block text-xs font-medium text-slate-300"
              >
                Full Name (with title / designation)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  enterKeyHint="next"
                  maxLength={120}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. A. K. Verma"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-slate-300"
              >
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  enterKeyHint="next"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@aicte-india.org"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="block text-xs font-medium text-slate-300"
              >
                Password (min. 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  enterKeyHint="done"
                  minLength={6}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-slate-300">
                Committee Role Assignment
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('scrutiny_officer')}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left transition-colors duration-150 tactile-press ${
                    role === 'scrutiny_officer'
                      ? 'border-teal bg-teal-500/15 text-white'
                      : 'border-slate-700 bg-navy-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold uppercase text-teal-400">
                    SCRUTINY OFFICER
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Dossier &amp; APH review
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('evc_officer')}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left transition-colors duration-150 tactile-press ${
                    role === 'evc_officer'
                      ? 'border-teal bg-teal-500/15 text-white'
                      : 'border-slate-700 bg-navy-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold uppercase text-teal-400">
                    EVC OFFICER
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Expert visit &amp; forensic
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal text-navy-900 hover:bg-teal-400 font-semibold text-sm flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50 tactile-press"
            >
              <span>
                {submitting ? 'Creating Officer Account...' : 'Create Officer Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </>
      )}

      <p className="text-xs text-slate-400 text-center pt-1">
        Already registered?{' '}
        <Link
          to="/signin"
          className="text-teal-400 hover:text-teal-300 font-semibold underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};
