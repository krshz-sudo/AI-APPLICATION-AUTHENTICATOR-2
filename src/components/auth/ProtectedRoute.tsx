import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';

export const POST_AUTH_REDIRECT_KEY = 'aicte_post_auth_redirect';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-navy-900 text-white flex flex-col items-center justify-center p-6 gap-4">
        <Logo variant="mark" size={44} animated={false} theme="dark" />
        <div className="text-center space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-teal-400">
            VERIFYING OFFICER SESSION
          </p>
          <p className="text-xs text-slate-400">
            Checking AICTE Scrutiny Portal credentials&hellip;
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const fullTarget = `${location.pathname}${location.search || ''}${location.hash || ''}`;
    try {
      sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, fullTarget);
    } catch {
      // Ignore storage errors in restricted environments
    }
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
