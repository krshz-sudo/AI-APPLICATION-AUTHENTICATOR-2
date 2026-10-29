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
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { DURATION, DURATION_MS, EASING, TRANSITION } from '../../motion/tokens';
import { useReducedMotionSafe } from '../../motion/useReducedMotionSafe';

interface PipelineStageSpec {
  step: string;
  id: string;
  title: string;
  toolName: string;
  gateRule: string;
  summary: string;
  outputMetric: string;
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
    institutionName: 'SAHYADRI INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SYNTHETIC)',
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
    institutionName: 'ARAVALLI COLLEGE OF ENGINEERING AND RESEARCH (SYNTHETIC)',
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
    institutionName: 'DAKSHIN BHARAT INSTITUTE OF INFORMATION TECHNOLOGY (SYNTHETIC)',
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
    institutionName: 'NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)',
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
    institutionName: 'BRAHMAPUTRA FRONTIER POLYTECHNIC AND TECH CAMPUS (SYNTHETIC)',
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Persistent Top Regulatory Simulation Notice Bar */}
      <div className="bg-navy-900 border-b border-slate-800/90 text-slate-300 text-[11px] sm:text-xs font-mono py-2 px-4 safe-top">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-saffron shrink-0" />
            <span className="font-semibold text-white tracking-wider uppercase">
              PROTOTYPE SIMULATION / SYNTHETIC DATA
            </span>
            <span className="hidden md:inline text-slate-400">
              — All institutional dossiers, PIDs, and verification runs are synthetic for SIH26261 regulatory demonstration.
            </span>
          </div>
          <span className="text-teal-400 font-semibold">
            AICTE APH 2024–27 Reference Corpus
          </span>
        </div>
      </div>

      {/* 1. Navbar */}
      <header className="bg-navy-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
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
              <Link
                to="/app?auth=signin"
                className="inline-flex items-center justify-center min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 bg-navy-800/60 tactile-press"
              >
                Sign in
              </Link>
              <Link
                to="/app?auth=signup"
                className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-teal text-navy-900 hover:bg-teal-400 shadow-sm tactile-press"
              >
                Sign up
              </Link>
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
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2.5">
                <Link
                  to="/app?auth=signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-center text-slate-200 border border-slate-700 bg-navy-800 flex items-center justify-center tactile-press"
                >
                  Sign in
                </Link>
                <Link
                  to="/app?auth=signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-center bg-teal text-navy-900 flex items-center justify-center tactile-press"
                >
                  Sign up
                </Link>
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
                  className="inline-flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-full bg-navy-800 border border-slate-700/90 text-xs font-mono"
                >
                  <span className="px-2 py-0.5 rounded bg-saffron/15 text-saffron border border-saffron/30 font-semibold">
                    PROTOTYPE SIMULATION / SYNTHETIC DATA
                  </span>
                  <span className="text-slate-300">
                    SIH26261 • AICTE Scrutiny &amp; Compliance Portal
                  </span>
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

              {/* Right Column: Live Architectural Dossier Inspection Specimen */}
              <motion.div variants={fadeUp} className="lg:col-span-5">
                <div className="bg-navy-800/90 border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-panel space-y-4">
                  {/* Specimen Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                          SCENARIO D • NON-COMPLIANT
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          PID: 1-5592509
                        </span>
                      </div>
                      <h2 className="text-xs sm:text-sm font-semibold text-white mt-1.5 truncate">
                        NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)
                      </h2>
                    </div>
                    <Link
                      to="/app"
                      className="shrink-0 font-mono text-[11px] text-teal-400 hover:text-teal-300 underline underline-offset-4"
                    >
                      Verify in /app →
                    </Link>
                  </div>

                  {/* Mini 4-Stage Status Bar */}
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                    <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-2 py-1.5 text-emerald-300">
                      <div className="font-semibold">1. OCR</div>
                      <div className="text-emerald-400/90">PASSED</div>
                    </div>
                    <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-2 py-1.5 text-emerald-300">
                      <div className="font-semibold">2. GATE</div>
                      <div className="text-emerald-400/90">PASSED</div>
                    </div>
                    <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-2 py-1.5 text-emerald-300">
                      <div className="font-semibold">3. AUTH</div>
                      <div className="text-emerald-400/90">0.14 LOW</div>
                    </div>
                    <div className="bg-red-950/70 border border-red-600/60 rounded-lg px-2 py-1.5 text-red-200">
                      <div className="font-semibold">4. RAG</div>
                      <div className="text-red-300">2 VIOLATIONS</div>
                    </div>
                  </div>

                  {/* Specimen Field Rows */}
                  <div className="space-y-2.5 text-xs">
                    <div className="bg-navy-900/80 border border-emerald-700/40 rounded-xl p-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] text-slate-400 uppercase">
                          PROPOSED INTAKE • RULE APH-2.4
                        </div>
                        <div className="font-medium text-slate-100 mt-0.5 truncate">
                          180 Seats (3 Divisions • Univ. NOC BTU/2026/408)
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        GREEN
                      </span>
                    </div>

                    <div className="bg-red-950/35 border border-red-500/50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-mono text-[10px] text-red-300 uppercase font-semibold">
                          FACULTY COUNT &amp; FSR • VIOLATES RULE APH-6.1 (p.119)
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-500/20 text-red-200 border border-red-500/40 shrink-0">
                          <XCircle className="w-3 h-3" />
                          RED
                        </span>
                      </div>
                      <div className="font-mono text-xs text-white font-semibold tabular-nums">
                        Extracted: &quot;18 Faculty (FSR 1:25)&quot;
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Handbook Norm: Minimum 1:20 Faculty-Student Ratio required for UG
                        Engineering (≥ 24 faculty for 480 total seats).
                      </p>
                    </div>

                    <div className="bg-red-950/35 border border-red-500/50 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-mono text-[10px] text-red-300 uppercase font-semibold">
                          FIRE &amp; LIFE SAFETY NOC • VIOLATES RULE APH-5.1 (p.102)
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-500/20 text-red-200 border border-red-500/40 shrink-0">
                          <XCircle className="w-3 h-3" />
                          RED
                        </span>
                      </div>
                      <div className="font-mono text-xs text-white font-semibold tabular-nums">
                        Extracted: &quot;15/03/2024&quot; (Expired prior to Academic Year 2026–27)
                      </div>
                    </div>
                  </div>

                  {/* Specimen Footer */}
                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>POST /api/verify → 422 (2410ms)</span>
                    <span className="text-teal-400">Supports Officer Inline Re-verify</span>
                  </div>
                </div>
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
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 self-start lg:self-auto"
              >
                <Terminal className="w-4 h-4 text-teal-700" />
                <span>
                  Active Sequence: <strong className="text-navy-900">{litStages}/4 Stages Lit</strong>
                </span>
              </motion.div>
            </motion.div>

            {/* 4-Stage Sequential Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PIPELINE_STAGES.map((stage, index) => {
                const stageNumber = index + 1;
                const isLit = litStages >= stageNumber;

                return (
                  <motion.article
                    key={stage.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate={isPipelineInView ? 'visible' : 'hidden'}
                    transition={getTransition({
                      duration: DURATION.base,
                      ease: EASING.easeOut,
                      delay: prefersReducedMotion ? 0 : index * 0.06,
                    })}
                    className={`relative rounded-xl p-5 border transition-colors duration-200 flex flex-col justify-between ${
                      isLit
                        ? 'bg-navy-900 text-white border-teal-500/70 shadow-panel'
                        : 'bg-[#F8FAFC] text-slate-500 border-slate-200'
                    }`}
                  >
                    {/* Top Progress Connector Bar (composite transform scaleX) */}
                    <div className="w-full h-1 bg-slate-200/30 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isLit ? 1 : 0 }}
                        transition={getTransition(TRANSITION.slowOut)}
                        style={{ transformOrigin: 'left' }}
                        className="h-full w-full bg-teal"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono text-xs font-bold tracking-wider ${
                            isLit ? 'text-teal-400' : 'text-slate-400'
                          }`}
                        >
                          {stage.step}
                        </span>
                        <motion.span
                          variants={scaleIn}
                          initial="hidden"
                          animate={isLit ? 'visible' : 'hidden'}
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            isLit
                              ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
                              : 'bg-slate-200 text-slate-500 border-slate-300'
                          }`}
                        >
                          {isLit ? 'STAGE ACTIVE' : 'WAITING'}
                        </motion.span>
                      </div>

                      <h3
                        className={`text-base font-bold tracking-tight ${
                          isLit ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {stage.title}
                      </h3>

                      <p
                        className={`text-xs leading-relaxed ${
                          isLit ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {stage.summary}
                      </p>
                    </div>

                    <div
                      className={`mt-5 pt-3 border-t flex items-center justify-between gap-2 text-[11px] font-mono ${
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
                  </motion.article>
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
                  SYNTHETIC INSTITUTIONAL BENCHMARK SUITE
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight"
                >
                  Scenarios A–E Dossier Verification Matrix
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-600">
                  Explore five pre-seeded synthetic institutions testing every regulatory
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
                  className={`bg-white rounded-xl border p-5 shadow-panel flex flex-col justify-between space-y-4 ${
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
                      <h3 className="text-sm sm:text-base font-bold text-navy-900 leading-snug">
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

                    <Link
                      to="/app"
                      className="inline-flex items-center justify-between w-full min-h-[42px] px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-navy-900 text-navy-900 hover:text-white text-xs font-semibold transition-colors tactile-press"
                    >
                      <span>Inspect Scenario {sc.id} Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
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
                  to="/app?auth=signin"
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
              <strong className="text-saffron">PROTOTYPE SIMULATION / SYNTHETIC DATA:</strong>{' '}
              Independent technical demonstration for Smart India Hackathon (SIH26261). Forensic
              authenticity outputs are risk indicators for human review, never proof of forgery.
            </p>
            <span className="font-mono text-[11px] text-slate-500 shrink-0">
              AICTE APH 2024–27 • React + TypeScript
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
