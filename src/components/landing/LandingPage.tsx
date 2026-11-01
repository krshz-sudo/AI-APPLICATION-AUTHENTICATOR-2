import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  BookOpenCheck,
  Database,
  UserCheck,
  Scale,
  Menu,
  X,
  Terminal,
  ChevronDown,
  ScanText,
  Fingerprint,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { DURATION, DURATION_MS, EASING, TRANSITION, SPRING } from '../../motion/tokens';
import { useReducedMotionSafe } from '../../motion/useReducedMotionSafe';
import { Collapse } from '../../motion/wrappers';
import { useAuth } from '../../context/AuthContext';
import { LandingHeroSpecimen } from './LandingHeroSpecimen';

interface PipelineStageSpec {
  step: string;
  id: string;
  title: string;
  toolName: string;
  gateRule: string;
  summary: string;
  outputMetric: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGlow: string;
  badgeTone: string;
  dotColor: string;
  connectorGradient: string;
}

const PIPELINE_STAGES: PipelineStageSpec[] = [
  {
    step: 'STAGE 01',
    id: 'ocr',
    title: 'Document Input & OCR Extraction',
    toolName: 'ocrTool',
    gateRule: 'Annexures 1–9',
    summary:
      'Parses multi-page institutional PDFs into 10 normalized statutory fields: PID, Application ID, Course, Intake, Built-up Area, Land Tenure, Fire NOC, and Faculty-Student Ratio.',
    outputMetric: '10/10 Fields Structured',
    icon: ScanText,
    accentGlow: 'shadow-[0_0_30px_rgba(20,184,166,0.2)]',
    badgeTone: 'border-teal-500/40 bg-teal-500/20 text-teal-300',
    dotColor: 'bg-teal-400',
    connectorGradient: 'from-teal-400 to-emerald-400',
  },
  {
    step: 'STAGE 02',
    id: 'template',
    title: 'Template & Mandatory Gate',
    toolName: 'templateTool',
    gateRule: 'APH-1.1 • APH-1.5',
    summary:
      'Enforces hard structural preconditions before expensive downstream checks: Permanent Institute ID presence and strict DD/MM/YYYY statutory date formatting. Halts pipeline on violation.',
    outputMetric: 'Gate Decision: YES / HALT',
    icon: ShieldCheck,
    accentGlow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    badgeTone: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
    dotColor: 'bg-emerald-400',
    connectorGradient: 'from-emerald-400 to-amber-400',
  },
  {
    step: 'STAGE 03',
    id: 'authenticity',
    title: 'Forensic Authenticity Screening',
    toolName: 'authenticityTool',
    gateRule: 'AUTH-2.2 • AUTH-3.1',
    summary:
      'Screens Error Level Analysis (ELA) compression residuals, perceptual lab photo hashes (pHash), and DigiLocker / State Fire Portal records. Surfaces elevated anomalies strictly as a risk indicator for officer inspection.',
    outputMetric: 'Risk Indicator: 0.11–0.78',
    icon: Fingerprint,
    accentGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    badgeTone: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
    dotColor: 'bg-amber-400',
    connectorGradient: 'from-amber-400 to-indigo-400',
  },
  {
    step: 'STAGE 04',
    id: 'compliance',
    title: 'APH 2024–27 RAG Compliance',
    toolName: 'ragRetrieveTool + complianceTool',
    gateRule: 'APH-2.4 • APH-5.1 • APH-6.1',
    summary:
      'Retrieves top-k AICTE Approval Process Handbook clauses from ChromaDB vector storage and runs deterministic rule evaluators to classify each field as Compliant, Non-Compliant, or Requires Human Review.',
    outputMetric: 'Citation-Backed Verdict',
    icon: Scale,
    accentGlow: 'shadow-[0_0_30px_rgba(99,102,241,0.2)]',
    badgeTone: 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300',
    dotColor: 'bg-indigo-400',
    connectorGradient: 'from-indigo-400 to-teal-400',
  },
];

interface ScenarioShowcaseCard {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  code: string;
  institutionName: string;
  pid: string;
  appId: string;
  applicationType: string;
  statusLabel: 'Passed' | 'Failed' | 'Flagged' | 'Requires Human Review';
  statusTone: 'green' | 'red' | 'amber' | 'indigo';
  stageSummary: string;
  fieldCounts: string;
  ruleHighlights: string[];
  description: string;
}

const SCENARIO_SHOWCASE: ScenarioShowcaseCard[] = [
  {
    id: 'A',
    code: 'SCENARIO A',
    institutionName: 'SAHYADRI INSTITUTE OF TECHNOLOGY AND MANAGEMENT',
    pid: '1-4829104',
    appId: '1-44642983101',
    applicationType: 'Extension of Approval (EoA 2026-27)',
    statusLabel: 'Passed',
    statusTone: 'green',
    stageSummary: 'OCR ✓ → Template ✓ → Authenticity ✓ → Compliance ✓',
    fieldCounts: '10 Green • 0 Red • 0 Amber',
    ruleHighlights: ['APH-6.1 (FSR 1:15)', 'APH-5.1 (NOC 2028)', 'APH-2.4 (180 Seats)'],
    description:
      'Fully compliant EoA dossier. DigiLocker Fire NOC and University affiliation verified with low forensic risk indicator (0.12) and 10/10 APH norm checks passed.',
  },
  {
    id: 'B',
    code: 'SCENARIO B',
    institutionName: 'ARAVALLI COLLEGE OF ENGINEERING AND RESEARCH',
    pid: '[MISSING]',
    appId: '1-44642983192',
    applicationType: 'Increase in Intake (2026-27)',
    statusLabel: 'Failed',
    statusTone: 'red',
    stageSummary: 'OCR ✓ → Template ✕ (HALT) → Auth [Skipped] → RAG [Skipped]',
    fieldCounts: '8 Green • 2 Red • 0 Amber',
    ruleHighlights: ['APH-1.1 (Missing PID)', 'APH-1.5 (ISO Date 2028-04-15)'],
    description:
      'Halted deterministically at Stage 2 Template Gate due to missing mandatory Permanent Institute ID and non-standard YYYY-MM-DD Fire NOC date syntax.',
  },
  {
    id: 'C',
    code: 'SCENARIO C',
    institutionName: 'DAKSHIN BHARAT INSTITUTE OF INFORMATION TECHNOLOGY',
    pid: '1-6193058',
    appId: '1-44642983245',
    applicationType: 'Extension of Approval (EoA 2026-27)',
    statusLabel: 'Flagged',
    statusTone: 'amber',
    stageSummary: 'OCR ✓ → Template ✓ → Authenticity ⚠ (0.78) → RAG [Skipped]',
    fieldCounts: '10 Syntactic Green • Stage 3 Risk Indicator',
    ruleHighlights: ['AUTH-2.2 (ELA Stamp Shift)', 'AUTH-3.1 (Lab Photo pHash Δ=2)'],
    description:
      'Surfaces an elevated forensic risk indicator (0.78) around the Fire NOC expiry box and duplicate lab photo hash. Routed for physical certificate inspection (risk indicator, never proof of forgery).',
  },
  {
    id: 'D',
    code: 'SCENARIO D • MAIN DEMO',
    institutionName: 'NALANDA VISHWA ENGINEERING ACADEMY',
    pid: '1-5592509',
    appId: '1-44642983297',
    applicationType: 'Extension of Approval (EoA 2026-27)',
    statusLabel: 'Failed',
    statusTone: 'red',
    stageSummary: 'OCR ✓ → Template ✓ → Authenticity ✓ → Compliance ✕',
    fieldCounts: '8 Green • 2 Red • 0 Amber',
    ruleHighlights: ['APH-6.1 (FSR 1:25 > 1:20)', 'APH-5.1 (Expired NOC 15/03/2024)'],
    description:
      'Passes template and authenticity checks but fails Stage 4 RAG Compliance on two substantive norms. Demonstrates interactive (i) rule popovers, inline field editing, and instant Re-verify.',
  },
  {
    id: 'E',
    code: 'SCENARIO E',
    institutionName: 'BRAHMAPUTRA FRONTIER POLYTECHNIC AND TECH CAMPUS',
    pid: '1-8904112',
    appId: '1-44642983388',
    applicationType: 'EoA with Special Regional Provision (2026-27)',
    statusLabel: 'Requires Human Review',
    statusTone: 'indigo',
    stageSummary: 'OCR ✓ → Template ✓ → Authenticity ✓ → Compliance ? (SHC)',
    fieldCounts: '8 Green • 0 Red • 2 Amber',
    ruleHighlights: ['APH-7.2 (Hill Council Land Grant)', 'AUD-2.5 (Provisional Intake)'],
    description:
      'Evaluates to INSUFFICIENT_EVIDENCE where no deterministic APH clause covers Autonomous Hill Council customary land tenure. Escalates cleanly to a Standing Hearing Committee officer.',
  },
];

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedStageId, setExpandedStageId] = useState<string | null>('ocr');
  const { isAuthenticated } = useAuth();
  const {
    prefersReducedMotion,
    fadeUp,
    staggerContainer,
    scaleIn,
    getTransition,
  } = useReducedMotionSafe();

  // Sequential 4-stage pipeline scroll-into-view trigger (runs once, never loops)
  const pipelineRef = useRef<HTMLDivElement | null>(null);
  const isPipelineInView = useInView(pipelineRef, {
    once: true,
    amount: 0.25,
  });
  const [litStages, setLitStages] = useState<number>(prefersReducedMotion ? 4 : 0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setLitStages(4);
      return;
    }
    if (!isPipelineInView) return;

    const stepMs = DURATION_MS.slow; // 240ms token step
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    for (let i = 1; i <= 4; i++) {
      const t = setTimeout(() => {
        setLitStages(i);
      }, (i - 1) * stepMs);
      timers.push(t);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isPipelineInView, prefersReducedMotion]);

  const handleReplayPipeline = () => {
    if (prefersReducedMotion) {
      setLitStages(4);
      return;
    }
    setLitStages(0);
    setTimeout(() => setLitStages(1), 80);
    setTimeout(() => setLitStages(2), 320);
    setTimeout(() => setLitStages(3), 560);
    setTimeout(() => setLitStages(4), 800);
  };

  const statusChipStyles = (tone: ScenarioShowcaseCard['statusTone']) => {
    switch (tone) {
      case 'green':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'red':
        return 'bg-red-50 text-red-800 border-red-300';
      case 'amber':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-900 border-indigo-300';
    }
  };

  const statusChipIcon = (tone: ScenarioShowcaseCard['statusTone']) => {
    switch (tone) {
      case 'green':
        return <CheckCircle2 className="w-3.5 h-3.5 text-status-green shrink-0" />;
      case 'red':
        return <XCircle className="w-3.5 h-3.5 text-status-red shrink-0" />;
      case 'amber':
        return <AlertTriangle className="w-3.5 h-3.5 text-status-amber shrink-0" />;
      case 'indigo':
        return <Scale className="w-3.5 h-3.5 text-status-indigo shrink-0" />;
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* 1. Navbar */}
      <header className="bg-navy-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 safe-top">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Lockup */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-lg py-1 min-w-0"
              aria-label="AICTE Scrutiny & Compliance Portal Home"
            >
              <Logo variant="mark" size={34} animated={false} theme="dark" />
              <div className="flex flex-col min-w-0">
                <span className="font-sans font-bold text-sm sm:text-base text-white tracking-tight truncate">
                  AICTE Scrutiny &amp; Compliance Portal
                </span>
                <span className="font-mono text-[10px] text-teal-400 tracking-[0.14em] uppercase truncate">
                  STATUTORY DOSSIER VERIFICATION
                </span>
              </div>
            </Link>

            {/* Desktop Anchor Links */}
            <nav
              aria-label="Landing Page Sections"
              className="hidden lg:flex items-center gap-1"
            >
              <a
                href="#pipeline"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 tactile-press"
              >
                4-Stage Pipeline
              </a>
              <a
                href="#scenarios"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 tactile-press"
              >
                Scenarios A–E
              </a>
              <a
                href="#trust"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 tactile-press"
              >
                APH 2024–27 &amp; Trust
              </a>
            </nav>

            {/* Desktop Sign In / Sign Up & Launch Actions */}
            <div className="hidden sm:flex items-center gap-2.5">
              {isAuthenticated ? (
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-teal text-navy-900 hover:bg-teal-400 shadow-sm tactile-press"
                >
                  <span>Open portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="inline-flex items-center justify-center min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 bg-navy-800/60 tactile-press"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-teal text-navy-900 hover:bg-teal-400 shadow-sm tactile-press"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button (44x44px minimum tap target) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
              className="sm:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal tactile-press"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Collapsible Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-slate-800 py-3 space-y-2">
              <div className="flex flex-col space-y-1">
                <a
                  href="#pipeline"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center"
                >
                  4-Stage Verification Pipeline
                </a>
                <a
                  href="#scenarios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center"
                >
                  Scenarios A–E Showcase
                </a>
                <a
                  href="#trust"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center"
                >
                  APH 2024–27 Citations &amp; Audit Trust
                </a>
              </div>
              <div className="pt-2 border-t border-slate-800">
                {isAuthenticated ? (
                  <Link
                    to="/app"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-teal text-navy-900 flex items-center justify-center gap-1.5 tactile-press"
                  >
                    <span>Open portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-center text-slate-200 border border-slate-700 bg-navy-800 flex items-center justify-center tactile-press"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-teal text-navy-900 flex items-center justify-center tactile-press"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section (min-h-[calc(100svh-6.5rem)] avoids 100vh mobile URL bar clipping) */}
        <section className="relative bg-navy-900 text-white border-b border-slate-800 min-h-[calc(100svh-6.5rem)] flex items-center py-12 sm:py-16 lg:py-20">
          {/* Subtle architectural grid hairline background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #94A3B8 1px, transparent 1px), linear-gradient(to bottom, #94A3B8 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 w-full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
            >
              {/* Left Column: Animated Logo, Headline, Subheadline, Two CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-navy-800/90 border border-teal-500/30 text-xs font-mono shadow-sm"
                >
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
                  </span>
                  <span className="text-teal-300 font-semibold">STATUTORY SCRUTINY ENGINE</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-200">AICTE Regulatory Compliance &amp; Verification</span>
                </motion.div>

                {/* Animated Monolith Mark + Institutional Eyebrow */}
                <motion.div
                  variants={fadeUp}
                  className="flex items-center gap-4 pt-1"
                >
                  <div className="p-3 rounded-2xl bg-navy-800/90 border border-slate-700/80 shadow-panel">
                    <Logo
                      variant="mark"
                      size={72}
                      animated={true}
                      theme="dark"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="font-mono text-xs uppercase tracking-[0.16em] text-teal-400 font-semibold">
                      APPROVAL PROCESS HANDBOOK 2024–27
                    </div>
                    <div className="text-sm sm:text-base font-medium text-slate-300">
                      Sequential Multi-Agent Dossier Scrutiny &amp; Human-in-the-Loop Sign-Off
                    </div>
                  </div>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                >
                  Deterministic Statutory Scrutiny for Institutional Approval Dossiers.
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl"
                >
                  Verify Extension of Approval (EoA) and Intake submissions across a strict
                  4-stage gate: structured OCR extraction, mandatory template validation,
                  forensic{' '}
                  <span className="text-white font-medium underline decoration-teal-500/60 underline-offset-4">
                    risk indicator
                  </span>{' '}
                  screening, and citation-backed RAG compliance over the AICTE Approval
                  Process Handbook.
                </motion.p>

                {/* Two CTAs (44px+ tap targets) */}
                <motion.div
                  variants={fadeUp}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
                >
                  <Link
                    to="/app"
                    className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-6 py-3 rounded-xl bg-teal text-navy-900 font-semibold text-sm sm:text-base hover:bg-teal-400 shadow-sm tactile-press"
                  >
                    <span>Open Scrutiny Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#pipeline"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-navy-800 hover:bg-slate-800 text-slate-100 border border-slate-700 font-medium text-sm sm:text-base tactile-press"
                  >
                    <span>Inspect 4-Stage Pipeline</span>
                  </a>
                </motion.div>

                {/* Key Institutional Guarantees */}
                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/90 text-xs font-mono"
                >
                  <div>
                    <div className="text-teal-400 font-semibold text-sm sm:text-base tabular-nums">
                      10 Fields
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Annexures 1–9 Extracted
                    </div>
                  </div>
                  <div>
                    <div className="text-teal-400 font-semibold text-sm sm:text-base tabular-nums">
                      4 Stages
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      Strict Sequential Gate
                    </div>
                  </div>
                  <div>
                    <div className="text-teal-400 font-semibold text-sm sm:text-base tabular-nums">
                      100% Cited
                    </div>
                    <div className="text-slate-400 mt-0.5">
                      APH 2024–27 Clauses
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Custom Illustrated Form Specimen */}
              <motion.div variants={fadeUp} className="lg:col-span-5">
                <LandingHeroSpecimen />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 3. Animated 4-Stage Pipeline Section (OCR → Template → Authenticity → Compliance) */}
        <section
          id="pipeline"
          ref={pipelineRef}
          className="py-16 sm:py-20 border-b border-slate-200 bg-white scroll-mt-16"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <motion.div
                  variants={fadeUp}
                  className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700"
                >
                  SEQUENTIAL VERIFICATION ARCHITECTURE
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight"
                >
                  4-Stage Deterministic Scrutiny Pipeline
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-600">
                  Each dossier progresses through four strictly ordered gates. Stages light up
                  in sequence as they enter view; in production runs, a failure at Stage 2 or an
                  elevated forensic risk indicator at Stage 3 halts downstream RAG execution.
                </motion.p>
              </div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 self-start lg:self-auto flex-wrap"
              >
                <button
                  type="button"
                  onClick={handleReplayPipeline}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-mono font-semibold transition-colors shadow-2xs tactile-press"
                  title="Re-run the sequential pipeline verification animation"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-700" />
                  <span>Replay Flow</span>
                </button>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
                  </span>
                  <span>
                    Active Sequence: <strong className="text-navy-900">{litStages}/4 Stages Lit</strong>
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* 4-Stage Sequential Grid (Animated Interactive Stage Cards with Flow Bridges) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start relative">
              {PIPELINE_STAGES.map((stage, index) => {
                const stageNumber = index + 1;
                const isLit = litStages >= stageNumber;
                const isExpanded = expandedStageId === stage.id;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.id} className="relative">
                    <motion.article
                      variants={fadeUp}
                      initial="hidden"
                      animate={isPipelineInView ? 'visible' : 'hidden'}
                      whileHover={prefersReducedMotion ? {} : { y: -4, transition: SPRING.gentle }}
                      transition={getTransition({
                        duration: DURATION.base,
                        ease: EASING.easeOut,
                        delay: prefersReducedMotion ? 0 : index * 0.06,
                      })}
                      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isLit
                          ? isExpanded
                            ? `bg-navy-900 text-white border-teal-400 ${stage.accentGlow} ring-1 ring-teal-400/40`
                            : `bg-navy-900 text-white ${stage.accentGlow} border-slate-700 hover:border-teal-400`
                          : 'bg-[#F8FAFC] text-slate-500 border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStageId((prev) =>
                            prev === stage.id ? null : stage.id
                          )
                        }
                        aria-expanded={isExpanded}
                        aria-controls={`stage-detail-${stage.id}`}
                        className="w-full p-5 text-left flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal tactile-press"
                      >
                        {/* Top Animated Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden mb-4">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isLit ? 1 : 0 }}
                            transition={getTransition(TRANSITION.slowOut)}
                            style={{ transformOrigin: 'left' }}
                            className={`h-full w-full bg-gradient-to-r ${stage.connectorGradient}`}
                          />
                        </div>

                        <div className="space-y-3 w-full">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Stage Luminous Icon */}
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                                  isLit
                                    ? 'bg-slate-800/90 border-slate-700 text-white shadow-xs'
                                    : 'bg-slate-200/90 border-slate-300 text-slate-400'
                                }`}
                              >
                                <StageIcon className={`w-4 h-4 ${isLit ? stage.dotColor.replace('bg-', 'text-') : 'text-slate-400'}`} />
                              </div>
                              <span
                                className={`font-mono text-xs font-bold tracking-wider ${
                                  isLit ? 'text-teal-300' : 'text-slate-400'
                                }`}
                              >
                                {stage.step}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <motion.span
                                variants={scaleIn}
                                initial="hidden"
                                animate={isLit ? 'visible' : 'hidden'}
                                className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isLit
                                    ? stage.badgeTone
                                    : 'bg-slate-200 text-slate-500 border-slate-300'
                                }`}
                              >
                                {isLit && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stage.dotColor} opacity-75 motion-reduce:hidden`} />
                                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${stage.dotColor}`} />
                                  </span>
                                )}
                                <span>{isLit ? 'ACTIVE GATE' : 'WAITING'}</span>
                              </motion.span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
                                  isLit ? 'text-teal-400' : 'text-slate-400'
                                } ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>
                          </div>

                          <h3
                            className={`text-base font-bold tracking-tight leading-snug ${
                              isLit ? 'text-white' : 'text-slate-700'
                            }`}
                          >
                            {stage.title}
                          </h3>
                        </div>

                        <div
                          className={`mt-4 pt-3 border-t w-full flex items-center justify-between gap-2 text-[11px] font-mono ${
                            isLit
                              ? 'border-slate-800 text-slate-300'
                              : 'border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="truncate">{stage.toolName}</span>
                          <span
                            className={`font-semibold shrink-0 ${
                              isLit ? 'text-saffron' : 'text-slate-400'
                            }`}
                          >
                            {stage.gateRule}
                          </span>
                        </div>
                      </button>

                      <Collapse open={isExpanded}>
                        <div
                          id={`stage-detail-${stage.id}`}
                          className={`px-5 pb-5 pt-1 border-t space-y-2.5 ${
                            isLit ? 'border-slate-800/90' : 'border-slate-200'
                          }`}
                        >
                          <p
                            className={`text-xs leading-relaxed ${
                              isLit ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {stage.summary}
                          </p>
                          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold px-2.5 py-1 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                            <span>{stage.outputMetric}</span>
                          </div>
                        </div>
                      </Collapse>
                    </motion.article>

                    {/* Connecting Flow Arrow Between Stages (desktop only) */}
                    {index < PIPELINE_STAGES.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-navy-800 border border-slate-700 items-center justify-center text-slate-400 shadow-md pointer-events-none"
                      >
                        <ArrowRight
                          className={`w-3.5 h-3.5 transition-colors duration-200 ${
                            isLit ? 'text-teal-400' : 'text-slate-600'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Scenario Showcase A–E Section */}
        <section
          id="scenarios"
          className="py-16 sm:py-20 border-b border-slate-200 bg-[#F8FAFC] scroll-mt-16"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <motion.div
                  variants={fadeUp}
                  className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700"
                >
                  STATUTORY INSTITUTIONAL BENCHMARK SUITE
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight"
                >
                  Scenarios A–E Dossier Verification Matrix
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-600">
                  Explore five pre-seeded institutional dossiers testing every regulatory
                  disposition: full compliance, Stage 2 gate halt, Stage 3 forensic{' '}
                  <strong className="font-semibold text-slate-800">risk indicator</strong>{' '}
                  flagging, Stage 4 APH norm failure, and Standing Hearing Committee escalation.
                </motion.p>
              </div>

              <motion.div variants={fadeUp}>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 text-xs sm:text-sm font-semibold tactile-press"
                >
                  <span>Run All 5 Scenarios in /app</span>
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Scenario Cards Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {SCENARIO_SHOWCASE.map((sc) => (
                <motion.article
                  key={sc.id}
                  variants={fadeUp}
                  className="flex"
                >
                  <Link
                    to={`/app?scenario=${sc.id}`}
                    aria-label={`Inspect ${sc.code}: ${sc.institutionName} (${sc.statusLabel})`}
                    className={`group w-full bg-white rounded-xl border p-5 shadow-panel flex flex-col justify-between space-y-4 transition-colors duration-150 hover:border-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal tactile-press ${
                      sc.id === 'D'
                        ? 'border-navy-900 ring-1 ring-navy-900/10'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Scenario Code + Status Chip */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-navy-900">
                          {sc.code}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusChipStyles(
                            sc.statusTone
                          )}`}
                        >
                          {statusChipIcon(sc.statusTone)}
                          <span>{sc.statusLabel}</span>
                        </span>
                      </div>

                      {/* Synthetic Institution Name */}
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-navy-900 leading-snug group-hover:text-teal-700 transition-colors">
                          {sc.institutionName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-mono text-slate-500 tabular-nums">
                          <span>PID: {sc.pid}</span>
                          <span>•</span>
                          <span>App: {sc.appId}</span>
                        </div>
                      </div>

                      {/* Stage Progression Pill */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 font-mono text-[11px] text-slate-700">
                        <div className="font-semibold text-navy-900">{sc.stageSummary}</div>
                        <div className="text-slate-500 mt-0.5">{sc.fieldCounts}</div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {/* Cited Clauses */}
                      <div className="flex flex-wrap gap-1.5">
                        {sc.ruleHighlights.map((rule) => (
                          <span
                            key={rule}
                            className="font-mono text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>

                      <div className="inline-flex items-center justify-between w-full min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-100 group-hover:bg-navy-900 text-navy-900 group-hover:text-white text-xs font-semibold transition-colors">
                        <span>Inspect Scenario {sc.id} Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 5. Trust & Regulatory Governance Section */}
        <section
          id="trust"
          className="py-16 sm:py-20 bg-white border-b border-slate-200 scroll-mt-16"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="space-y-2 max-w-3xl"
            >
              <motion.div
                variants={fadeUp}
                className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-teal-700"
              >
                INSTITUTIONAL SAFEGUARDS &amp; AUDITABILITY
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight"
              >
                Built for Statutory Accountability, Never Black-Box Decisions
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-600">
                Every verification check is anchored to a verifiable handbook clause, logged
                to an inspectable SQL and REST telemetry trail, and governed by a human
                Reviewing Officer.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Pillar 1: APH 2024–27 Rule Citations */}
              <motion.div
                variants={fadeUp}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-900 text-teal-400 flex items-center justify-center">
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">
                    1. APH 2024–27 Clause Citations
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Every red or amber field badge links directly to its governing AICTE Approval
                    Process Handbook 2024–27 chapter, clause, page number, and verbatim text
                    snippet.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3.5 font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-navy-900 font-semibold">
                    <span>Rule APH-6.1 (Annexure-5)</span>
                    <span className="text-teal-700">Page 119</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal">
                    &quot;Minimum Faculty-Student Ratio (FSR) for UG Engineering programmes shall
                    be 1:20 across approved intake...&quot;
                  </p>
                </div>
              </motion.div>

              {/* Pillar 2: Immutable Audit Log & Telemetry */}
              <motion.div
                variants={fadeUp}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-900 text-teal-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">
                    2. Verifiable Audit &amp; SQL Log Trail
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Every orchestrator step, ChromaDB vector similarity score, REST API call
                    (<code className="font-mono text-xs">POST /api/verify</code>), and PostgreSQL
                    record mutation is recorded with millisecond precision.
                  </p>
                </div>

                <div className="bg-navy-900 text-slate-200 rounded-lg p-3.5 font-mono text-[11px] space-y-1">
                  <div className="text-teal-400">
                    [14:22:08] ragRetrieveTool → top-3 (0.91, 0.84, 0.79)
                  </div>
                  <div className="text-amber-300">
                    [14:22:09] complianceTool → NO (APH-6.1, APH-5.1)
                  </div>
                  <div className="text-slate-400">
                    [14:22:09] dbTool → INSERT verification_results
                  </div>
                </div>
              </motion.div>

              {/* Pillar 3: Human-in-the-Loop & Risk Indicator Safeguard */}
              <motion.div
                variants={fadeUp}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-900 text-teal-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">
                    3. Human-in-the-Loop Officer Review
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Forensic ELA and pHash anomalies are surfaced strictly as a{' '}
                    <strong className="font-semibold text-navy-900">risk indicator</strong> for
                    officer verification—never as automated proof of forgery. Reviewing Officers
                    can inspect, edit, re-verify, and record formal sign-off.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-950 space-y-1">
                  <div className="font-mono font-semibold uppercase tracking-wider text-[10px] text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-status-amber shrink-0" />
                    <span>STATUTORY SAFEGUARD POLICY</span>
                  </div>
                  <p className="text-[11px] leading-normal">
                    Elevated authenticity scores require physical certificate cross-verification by
                    the Scrutiny / Standing Hearing Committee Officer.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 6. Final CTA Section */}
        <section className="py-14 sm:py-16 bg-[#F8FAFC]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-navy-900 border border-slate-800 rounded-2xl p-6 sm:p-10 text-white shadow-panel flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="hidden sm:flex p-3 rounded-xl bg-navy-800 border border-slate-700 shrink-0">
                  <Logo variant="mark" size={48} animated={false} theme="dark" />
                </div>
                <div className="space-y-1.5 max-w-2xl">
                  <div className="font-mono text-xs text-teal-400 uppercase tracking-widest font-semibold">
                    READY FOR LIVE SCRUTINY SIMULATION
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Inspect Scenarios A–E, Inline Re-Verification, and APH Citations
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Launch the full AI Document Analyser workspace at <code className="font-mono text-teal-300">/app</code> to run the 4-stage pipeline, test Auto-Fix on Scenario D, and export official scrutiny reports.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-xl bg-teal text-navy-900 font-semibold text-sm hover:bg-teal-400 tactile-press"
                >
                  <span>Launch /app Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center justify-center min-h-[48px] px-5 py-3 rounded-xl bg-navy-800 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm tactile-press"
                >
                  Officer Sign in
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-slate-800 text-slate-400 py-10 safe-bottom">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Logo variant="full" size={32} animated={false} theme="dark" />

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
              <Link to="/app" className="hover:text-teal-400 transition-colors">
                Scrutiny Workspace (/app)
              </Link>
              <a href="#pipeline" className="hover:text-teal-400 transition-colors">
                4-Stage Pipeline
              </a>
              <a href="#scenarios" className="hover:text-teal-400 transition-colors">
                Scenarios A–E
              </a>
              <a href="#trust" className="hover:text-teal-400 transition-colors">
                APH 2024–27 Citations
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <p className="font-mono text-[11px] text-slate-400">
              <strong className="text-teal-400">STATUTORY SCRUTINY ADVISORY:</strong>{' '}
              Forensic authenticity outputs are risk indicators for scrutiny officer review, never automated proof of forgery. All regulatory actions require human-in-the-loop sign-off under AICTE APH 2024–27.
            </p>
            <span className="font-mono text-[11px] text-slate-500 shrink-0">
              AICTE APH 2024–27 • Regulatory Verification Portal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
