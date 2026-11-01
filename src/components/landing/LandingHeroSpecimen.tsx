import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  AlertTriangle,
  X,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useReducedMotionSafe } from '../../motion/useReducedMotionSafe';
import { SPRING } from '../../motion/tokens';

export const LandingHeroSpecimen: React.FC = () => {
  const { prefersReducedMotion } = useReducedMotionSafe();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full max-w-xl mx-auto"
    >
      {/* Playful Ambient Decorative Starbursts / Sparkles */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 -left-4 text-amber-400 select-none animate-pulse"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 -right-3 text-teal-400 select-none"
      >
        <Sparkles className="w-6 h-6 animate-bounce" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -right-2 text-amber-400 select-none"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* Main Specimen White Card */}
      <div className="relative bg-white rounded-3xl border-2 border-slate-200/90 shadow-[0_20px_50px_rgba(8,112,184,0.12)] p-4 sm:p-6 text-slate-800 transition-all duration-200 hover:shadow-[0_25px_60px_rgba(8,112,184,0.18)]">
        {/* Row 1: Academy Header Banner */}
        <div className="bg-[#EEF5FF] border-2 border-[#C9DFFE] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Cute Cartoonish Graduation Cap SVG */}
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-sky-200 shadow-sm flex items-center justify-center shrink-0">
              <svg
                width="34"
                height="34"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform -rotate-6"
              >
                {/* Mortarboard Diamond */}
                <path
                  d="M18 6L32 13L18 20L4 13L18 6Z"
                  fill="#1E3A8A"
                  stroke="#0F172A"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                {/* Cap Base */}
                <path
                  d="M10 16.5V23C10 25.5 13.5 27.5 18 27.5C22.5 27.5 26 25.5 26 23V16.5"
                  fill="#1E293B"
                  stroke="#0F172A"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Golden Hanging Tassel */}
                <path
                  d="M8 15V22.5"
                  stroke="#F59E0B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="23.5" r="2" fill="#D97706" />
                <circle cx="18" cy="13" r="1.5" fill="#F59E0B" />
              </svg>
            </div>

            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                Nalanda Vishwa Engineering Academy
              </h3>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                Institutional Statutory Dossier • EoA Cycle 2026–27
              </p>
            </div>
          </div>

          {/* Right Status Pill */}
          <div className="shrink-0 text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFE4E6] text-rose-800 border border-rose-300 shadow-xs">
              Scenario D • Non-Compliant
            </span>
            <div className="text-[10px] font-mono font-semibold text-slate-500 mt-1">
              PID: 1-5592509
            </div>
          </div>
        </div>

        {/* Row 2: 4-Gate Mini Pipeline Stepper */}
        <div className="mt-3.5 grid grid-cols-4 gap-1.5 sm:gap-2">
          {/* Gate 1 */}
          <div className="bg-[#EBFBF2] border-2 border-[#86EFAC] rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 font-bold text-emerald-800 text-[11px] sm:text-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>1. OCR</span>
            </div>
            <span className="text-[9px] font-semibold text-emerald-700 mt-0.5">Passed</span>
          </div>

          {/* Gate 2 */}
          <div className="bg-[#EBFBF2] border-2 border-[#86EFAC] rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 font-bold text-emerald-800 text-[11px] sm:text-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>2. GATE</span>
            </div>
            <span className="text-[9px] font-semibold text-emerald-700 mt-0.5">Passed</span>
          </div>

          {/* Gate 3 */}
          <div className="bg-[#EBFBF2] border-2 border-[#86EFAC] rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 font-bold text-emerald-800 text-[11px] sm:text-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>3. AUTH</span>
            </div>
            <span className="text-[9px] font-semibold text-emerald-700 mt-0.5">0.14 Low</span>
          </div>

          {/* Gate 4 */}
          <div className="bg-[#FFF1F2] border-2 border-[#FDA4AF] rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 font-bold text-rose-800 text-[11px] sm:text-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px]">
                <AlertTriangle className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>4. RAG</span>
            </div>
            <span className="text-[9px] font-semibold text-rose-700 mt-0.5">2 Violations</span>
          </div>
        </div>

        {/* Row 3: Field Verification Cards (Stacked with lively colors) */}
        <div className="mt-3.5 space-y-2.5">
          {/* Field 1: Proposed Intake (Compliant) */}
          <div className="bg-[#F0F7FF] border-2 border-[#BFDBFE] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Cute Document Icon with Green Check SVG */}
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 3H14L18 7V20C18 20.6 17.6 21 17 21H6C5.4 21 5 20.6 5 20V4C5 3.4 5.4 3 6 3Z"
                    fill="#E0F2FE"
                    stroke="#0284C7"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M14 3V7H18" stroke="#0284C7" strokeWidth="1.8" />
                  <path d="M8 11H14M8 15H12" stroke="#0369A1" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="16" cy="17" r="4.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M14.5 17L15.5 18L17.5 16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <span>Proposed Intake</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-slate-500">Rule APH-2.4</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                  180 Seats (3 Divisions • Univ. NOC BTU/2026/408)
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-[#E8FAF0] text-emerald-800 border border-[#86EFAC]">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>GREEN</span>
              </span>
            </div>
          </div>

          {/* Field 2: Faculty Count & FSR (Violated) */}
          <div className="bg-[#FFF1F2] border-2 border-[#FECDD3] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Cute Cartoonish Campus Building SVG */}
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  {/* Building Base */}
                  <rect x="4" y="8" width="16" height="13" rx="1.5" fill="#FFEDD5" stroke="#EA580C" strokeWidth="1.5" />
                  {/* Roof Gable */}
                  <path d="M3 8L12 3L21 8" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Tiny Windows */}
                  <rect x="7" y="10.5" width="2.5" height="2.5" rx="0.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
                  <rect x="14.5" y="10.5" width="2.5" height="2.5" rx="0.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.8" />
                  {/* Arched Door */}
                  <path d="M10 21V16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16V21" fill="#78350F" stroke="#451A03" strokeWidth="1" />
                  {/* Flag on Roof */}
                  <path d="M12 3V1.2M12 1.2L14.5 2.2L12 3.2" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <span>Faculty Count &amp; FSR</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-rose-700 font-semibold">Violates Rule APH-6.1 (p.119)</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                  Extracted: &ldquo;18 Faculty (FSR 1:25)&rdquo;
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Handbook Norm: Min 1:20 Ratio (Deficit: 6 faculty for 480 seats)
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-[#FFE4E6] text-rose-800 border border-[#FDA4AF]">
                <X className="w-3 h-3 stroke-[3]" />
                <span>RED</span>
              </span>
            </div>
          </div>

          {/* Field 3: Fire & Life Safety NOC (Violated) */}
          <div className="bg-[#FFF1F2] border-2 border-[#FECDD3] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {/* Cute Safety Shield SVG */}
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 5.5V11.5C4 16.5 7.4 20.9 12 22C16.6 20.9 20 16.5 20 11.5V5.5L12 2Z"
                    fill="#38BDF8"
                    stroke="#0284C7"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* White Safety Cross */}
                  <path
                    d="M12 7V16M7.5 11.5H16.5"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 truncate">
                  <span>Fire &amp; Life Safety NOC</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-rose-700 font-semibold">Violates Rule APH-5.1 (p.102)</span>
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 truncate">
                  Extracted: &ldquo;15/03/2024&rdquo;
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  Expired prior to Academic Year 2026–27 (Mandatory NOC required)
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-[#FFE4E6] text-rose-800 border border-[#FDA4AF]">
                <X className="w-3 h-3 stroke-[3]" />
                <span>RED</span>
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: Specimen Footer Bar */}
        <div className="mt-3.5 bg-[#EEF2FF] border-2 border-[#C7D2FE] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-xs">
          {/* Cloud Upload Check */}
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m8 16 4-4 4 4" />
              </svg>
            </div>
            <span className="font-mono text-[11px] text-slate-700">
              POST /api/verify → <strong>422 (2410ms)</strong>
            </span>
          </div>

          {/* Friendly Officer Avatar & Re-verify Link */}
          <Link
            to="/app?scenario=D"
            className="flex items-center gap-2 group font-semibold text-[11px] sm:text-xs text-indigo-900 hover:text-indigo-700 bg-white/90 hover:bg-white px-2.5 py-1.5 rounded-xl border border-indigo-200 transition-colors shadow-2xs"
          >
            {/* Cute Cartoonish Scrutiny Officer Avatar SVG */}
            <div className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center overflow-hidden shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="14" r="5" fill="#FDE047" />
                {/* Officer Cap */}
                <path d="M6 10C6 7.5 8.5 6 12 6C15.5 6 18 7.5 18 10H6Z" fill="#1E3A8A" />
                <path d="M5 10H19" stroke="#F59E0B" strokeWidth="1.5" />
                <circle cx="12" cy="8" r="1.2" fill="#F59E0B" />
                {/* Shoulders */}
                <path d="M4 22C4 18 7.5 17 12 17C16.5 17 20 18 20 22" fill="#1E3A8A" />
              </svg>
            </div>
            <span>Supports Officer Inline Re-verify</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
