import React from 'react';
import {
  Upload,
  GitBranch,
  FileCheck2,
  ClipboardList,
  History,
} from 'lucide-react';
import { ScreenId } from '../types';
import { LogoNavbarMark } from './brand/Logo';

interface NavbarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onSelectScreen,
}) => {
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
    <header className="bg-navy-900 border-b border-slate-800 sticky top-0 z-40 no-print">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 sm:py-3">
          {/* Left: App Title + Static Mark-Only Logo */}
          <button
            type="button"
            onClick={() => onSelectScreen('upload')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-lg transition-opacity hover:opacity-90 self-start sm:self-auto"
            aria-label="AICTE Scrutiny & Compliance Portal - Go to Upload"
          >
            <LogoNavbarMark size={32} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base text-white tracking-tight leading-tight">
                AICTE Scrutiny &amp; Compliance Portal
              </span>
              <span className="font-mono text-[10px] text-teal-400 tracking-wider uppercase leading-none mt-0.5">
                AI Document Analyser
              </span>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar"
          >
            {navItems.map((item) => {
              const active = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectScreen(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
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
        </div>
      </div>
    </header>
  );
};
