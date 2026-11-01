import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldAlert,
  BookOpenCheck,
  Database,
  UserCheck,
  Scale,
  Menu,
  X,
  ScanText,
  Fingerprint,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useReducedMotionSafe } from '../../motion/useReducedMotionSafe';
import { useAuth } from '../../context/AuthContext';
import { LandingHeroSpecimen } from './LandingHeroSpecimen';

interface PipelineStageSpec {
  step: string;
  gateLabel: string;
  id: string;
  title: string;
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
    gateLabel: 'EXTRACTION GATE',
    id: 'ocr',
    title: 'Document Input & OCR Extraction',
    summary:
      'Parses multi-page institutional PDFs into 10 normalized statutory fields: PID, Application ID, Course, Intake, Built-up Area, Land Tenure, Fire NOC, and Faculty-Student Ratio.',
    outputMetric: '10/10 Fields Extracted',
    icon: ScanText,
    accentGlow: 'shadow-[0_0_25px_rgba(20,184,166,0.22)]',
    badgeTone: 'border-teal-500/40 bg-teal-500/20 text-teal-300',
    dotColor: 'bg-teal-400',
    connectorGradient: 'from-cyan-400 to-teal-400',
  },
  {
    step: 'STAGE 02',
    gateLabel: 'STRUCTURAL GATE',
    id: 'template',
    title: 'Template & Mandatory Gate',
    summary:
      'Enforces hard structural preconditions before downstream evaluations: Permanent Institute ID presence and strict statutory date formatting. Halts pipeline on missing fields.',
    outputMetric: 'Gate Decision: PASS / HALT',
    icon: ShieldCheck,
    accentGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.22)]',
    badgeTone: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300',
    dotColor: 'bg-emerald-400',
    connectorGradient: 'from-emerald-400 to-teal-400',
  },
  {
    step: 'STAGE 03',
    gateLabel: 'AUTHENTICITY GATE',
    id: 'authenticity',
    title: 'Forensic Authenticity Screening',
    summary:
      'Screens Error Level Analysis (ELA) compression residuals, perceptual photo hashes, and digital issuer portal records for officer inspection.',
    outputMetric: 'Forensic Risk Scoring',
    icon: Fingerprint,
    accentGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.22)]',
    badgeTone: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
    dotColor: 'bg-amber-400',
    connectorGradient: 'from-amber-400 to-orange-400',
  },
  {
    step: 'STAGE 04',
    gateLabel: 'COMPLIANCE GATE',
    id: 'compliance',
    title: 'APH 2024–27 RAG Compliance',
    summary:
      'Retrieves vector handbook clauses from ChromaDB and runs deterministic evaluators to classify fields as Compliant, Non-Compliant, or Human Review.',
    outputMetric: 'Citation-Backed Verdict',
    icon: Scale,
    accentGlow: 'shadow-[0_0_25px_rgba(99,102,241,0.22)]',
    badgeTone: 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300',
    dotColor: 'bg-indigo-400',
    connectorGradient: 'from-indigo-400 to-purple-400',
  },
];

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const {
    fadeUp,
    staggerContainer,
  } = useReducedMotionSafe();

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
              className="hidden lg:flex items-center gap-2"
            >
              <a
                href="#pipeline"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 tactile-press"
              >
                4-Stage Pipeline
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

            {/* Mobile Hamburger Button */}
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
                    className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold bg-teal text-navy-900 hover:bg-teal-400 flex items-center justify-between"
                  >
                    <span>Open Scrutiny Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 border border-slate-700 flex items-center justify-center"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold bg-teal text-navy-900 hover:bg-teal-400 flex items-center justify-center"
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
        {/* 2. Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24 bg-navy-900 border-b border-slate-800 text-white overflow-hidden">
          {/* Subtle Institutional Grid Texture */}
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

                {/* Two CTAs */}
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

        {/* 3. Animated 4-Stage Pipeline Section (Horizontal Automated Workflow Marquee) */}
        <section
          id="pipeline"
          className="py-16 sm:py-20 border-b border-slate-200 bg-white scroll-mt-16 overflow-hidden"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-8">
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
                  CONTINUOUS VERIFICATION ARCHITECTURE
                </motion.div>
                <motion.h2
                  variants={fadeUp}
                  className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight"
                >
                  4-Stage Deterministic Scrutiny Pipeline
                </motion.h2>
                <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-600">
                  Each institutional dossier progresses through four strictly ordered gates in an automated sequence.
                  A failure at Stage 2 or elevated forensic risk indicator at Stage 3 halts downstream RAG execution.
                </motion.p>
              </div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 self-start lg:self-auto flex-wrap"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-900 border border-teal-500/30 text-xs font-mono text-teal-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
                  </span>
                  <span>Continuous Pipeline Workflow</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Continuous Horizontal Animated Track (Infinite Workflow Loop with Pause-On-Hover) */}
          <div className="relative mt-10 w-full overflow-hidden py-4">
            {/* Left and Right Subtle Gradient Fade Overlays */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-20"
            />

            <div className="animate-workflow-marquee flex items-center gap-6 px-4">
              {/* Duplicate the array twice so it forms a continuous, seamless infinite loop */}
              {[...PIPELINE_STAGES, ...PIPELINE_STAGES].map((stage, idx) => {
                const StageIcon = stage.icon;
                return (
                  <div key={`${stage.id}-${idx}`} className="flex items-center gap-6 shrink-0">
                    <div
                      className={`relative w-[320px] sm:w-[360px] rounded-2xl bg-navy-900 border border-slate-700/80 p-5 shadow-panel text-white transition-all duration-300 hover:border-teal-400 ${stage.accentGlow} flex flex-col justify-between space-y-4`}
                    >
                      {/* Top Animated Color Bar */}
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
                        <div
                          className={`h-full w-full bg-gradient-to-r ${stage.connectorGradient}`}
                        />
                      </div>

                      <div className="space-y-3">
                        {/* Header Row: Stage Icon, Step Badge, Gate Pill */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              <StageIcon className={`w-4 h-4 ${stage.dotColor.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="font-mono text-xs font-bold tracking-wider text-teal-300">
                              {stage.step}
                            </span>
                          </div>

                          <span
                            className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${stage.badgeTone}`}
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stage.dotColor} opacity-75 motion-reduce:hidden`} />
                              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${stage.dotColor}`} />
                            </span>
                            <span>{stage.gateLabel}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                          {stage.title}
                        </h3>

                        {/* Plain English Summary */}
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {stage.summary}
                        </p>
                      </div>

                      {/* Bottom Status Metric Pill */}
                      <div className="pt-3 border-t border-slate-800/90 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">Verdict Metric:</span>
                        <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {stage.outputMetric}
                        </span>
                      </div>
                    </div>

                    {/* Animated Flow Arrow Connecting Each Stage in the Continuous Loop */}
                    <div
                      aria-hidden="true"
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-800 border border-slate-700 text-teal-400 shrink-0 shadow-md"
                    >
                      <ArrowRight className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Trust & Regulatory Governance Section */}
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
                Governance, Citations &amp; Audit Integrity
              </motion.h2>
              <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-600">
                Statutory scrutiny requires full transparency. Every automated extraction cites
                its source clause, logs cryptographic hashes, and preserves human oversight.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Pillar 1: APH 2024-27 Norm Citations */}
              <motion.div
                variants={fadeUp}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-900 text-teal-400 flex items-center justify-center">
                    <BookOpenCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">
                    1. 100% Citation-Backed Rules
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Zero hallucinations. Compliance decisions cite specific chapters, pages, and
                    rule IDs in the AICTE Approval Process Handbook (APH 2024–27).
                  </p>
                </div>

                <div className="bg-slate-100 rounded-lg p-3 font-mono text-xs text-slate-700 space-y-1">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">
                    Core Scrutiny Norms
                  </div>
                  <div>• Rule APH-2.4 (Approved Intake &amp; NOC)</div>
                  <div>• Rule APH-5.1 (Fire &amp; Life Safety NOC)</div>
                  <div>• Rule APH-6.1 (Cadre &amp; FSR 1:20 Norm)</div>
                </div>
              </motion.div>

              {/* Pillar 2: Immutable Audit Log Trail */}
              <motion.div
                variants={fadeUp}
                className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-900 text-teal-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">
                    2. Verifiable Audit Trail
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Every extraction step, ChromaDB vector similarity score, and record mutation
                    is recorded with millisecond precision in the immutable scrutiny ledger.
                  </p>
                </div>

                <div className="bg-navy-900 text-slate-200 rounded-lg p-3.5 font-mono text-[11px] space-y-1">
                  <div className="text-teal-400">
                    [14:22:08] Semantic Retrieval → top-3 passages
                  </div>
                  <div className="text-amber-300">
                    [14:22:09] Rule Evaluation → APH-6.1, APH-5.1
                  </div>
                  <div className="text-slate-400">
                    [14:22:09] Audit Ledger → Record verified run
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

        {/* 5. Final CTA Section */}
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
                    REGULATORY SCRUTINY WORKSPACE
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Launch Deterministic Scrutiny &amp; Regulatory Verification
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Launch the full AI Document Analyser workspace at <code className="font-mono text-teal-300">/app</code> to run the 4-stage pipeline, inspect dossiers, and export official scrutiny reports.
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
