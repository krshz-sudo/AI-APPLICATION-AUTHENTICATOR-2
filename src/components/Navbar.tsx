import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  GitBranch,
  FileCheck2,
  ClipboardList,
  History,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { ScreenId } from '../types';
import { LogoNavbarMark } from './brand/Logo';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
  const navigate = useNavigate();
  const { displayName, role, signOut } = useAuth();
  const officerName = displayName || 'A. K. Verma';
  const roleLabel =
    role === 'evc_officer' ? 'EVC OFFICER' : 'SCRUTINY OFFICER';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems: { id: ScreenId; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload Dossier', icon: <Upload className="w-4 h-4" /> },
    { id: 'pipeline', label: 'AI Scrutiny', icon: <GitBranch className="w-4 h-4" /> },
    {
      id: 'review',
      label: 'Officer Review',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: 'report',
      label: 'Final Report',
      icon: <ClipboardList className="w-4 h-4" />,
    },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-navy-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 no-print safe-top">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3 min-w-0">
            {/* Left: App Title + Static Mark-Only Logo */}
            <button
              type="button"
              onClick={() => onSelectScreen('upload')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-lg transition-opacity hover:opacity-90 min-w-0"
              aria-label="AICTE Scrutiny & Compliance Portal - Go to Upload"
            >
              <LogoNavbarMark size={32} />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm sm:text-base text-white tracking-tight leading-tight truncate">
                  AICTE Scrutiny &amp; Compliance Portal
                </span>
                <span className="font-mono text-[10px] text-teal-400 tracking-[0.14em] uppercase leading-none mt-0.5 truncate">
                  AI Document Analyser
                </span>
              </div>
            </button>

            {/* Mobile Signed-in Officer Cluster */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <span
                title={`${officerName} • ${roleLabel}`}
                className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 shrink-0"
              >
                {roleLabel}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 bg-navy-800/70 transition-colors duration-150 tactile-press shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            {/* Navigation Tabs (0ms instant switch per MOTION_AUDIT.md Gate #1) */}
            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar"
            >
              {navItems.map((item) => {
                const active = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectScreen(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 min-h-[38px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                      active
                        ? 'bg-teal text-navy-900 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop Signed-in Officer Cluster (consistent with auth/landing header) */}
            <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-800 shrink-0">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-navy-800/70 border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
                <span
                  title={officerName}
                  className="text-xs font-medium text-slate-200 truncate max-w-[140px]"
                >
                  {officerName}
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 shrink-0">
                  {roleLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 bg-navy-800/60 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal tactile-press shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
