# UI & Motion Modernization (`feat/ui-motion-auth`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the AICTE Scrutiny & Regulatory Compliance Portal (`ai-document-analyser`) into a world-class, fluid, production-grade interface using modern design engineering tokens, high-craft physical motion, and interactive verification workflows.

**Architecture:** Strictly decouple frontend UI and motion components from backend simulation contracts. Use Tailwind CSS + CSS variables for a refined Linear/Apple/Vercel aesthetic, Framer Motion springs for tactile state transitions (red-to-green auto-fixes, pipeline stage progressions), Sonner for toasts, and responsive split-pane specimens.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Sonner.

**Spec Reference:** Baseline behavior pinned in [`BASELINE.md`](./BASELINE.md) across Scenarios A–E.

---

## Global Constraints & Freeze Rule

> [!IMPORTANT]
> **CRITICAL ARCHITECTURAL BOUNDARY:**
> - **NO files under `src/mock/*`** may be edited or modified (`api.ts`, `corpus.ts`, `orchestrator.ts`, `postgres.ts`, `tools.ts`, `vectorStore.ts`).
> - **NO files under `src/types.ts`** may be edited or modified. All domain contracts, `FieldKey`, `ScenarioId`, `VerificationRun`, `StageState`, and `OverallStatus` remain frozen.
> - All 5 Scenarios A–E must retain their exact deterministic behavior, status banners, stage progressions, and audit log entries as recorded in [`BASELINE.md`](./BASELINE.md).

---

## Review Focus & Failure Modes

1. **Stage Gating Continuity:** Scenario B must halt at Stage 2 and skip Stages 3–4; Scenario C must flag Stage 3 and skip Stage 4. No animation or UI change should trigger skipped stages prematurely.
2. **Deterministic Red/Green Status Sync:** Scenario D must start with 2 red fields (`fireNocValidUntil`, `facultyStudentRatio`) and 8 green fields. Editing or Auto-Fixing must cleanly transition those specific fields from red to green without affecting the other 8.
3. **Bounding Box Alignment:** Specimen bounding box overlays must align with document dimensions regardless of viewport scaling or window resize.
4. **Performance & Frame Budget:** Framer Motion springs and transforms must animate on composite-only properties (`transform`, `opacity`) without causing layout thrashing or dropping frames.
5. **No Regressions on Officer Decision Flow:** Approving, requesting correction, or escalating a dossier must update the audit timeline and persist to the simulated database without breaking run history.

---

## Phase Breakdown (Phases 1–7)

### Phase 1: Design Tokens, Typography & Color Palette Architecture
**Focus:** Establish a refined dark/light neutral palette, subtle hairline borders, elevated card surfaces, and precise typography inspired by `emil-design-eng` and `awesome-design-md` (Linear & Apple design systems).

**Files to Touch/Create:**
- Modify: `tailwind.config.js` (extend colors with surface levels, hairlines, and accent tokens)
- Modify: `src/index.css` (custom scrollbars, focus rings, base transitions, subtle badge utilities)
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] Extended theme with `canvas`, `surface-1`, `surface-2`, `surface-3`, `hairline`, `hairline-strong`, and semantic status tokens (`pass`, `fail`, `flag`, `review`).
- [ ] High-density tabular font utilities with proper negative tracking for display headers.
- [ ] Build passes clean verification (`npm run build`).

---

### Phase 2: Navigation, Header & Real-time System Status Bar
**Focus:** Modernize the top navigation bar, add real-time status indicators, scenario quick-switcher, and officer session badges.

**Files to Touch/Create:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/App.tsx` (wire scenario quick-switch and active navigation states)
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] Refined navigation header with tab pills, active indicator animations (Framer Motion `layoutId`), and AICTE regulatory badge.
- [ ] Quick-access scenario switcher pills (A: Compliant, B: Gate Fail, C: Flagged, D: APH Non-Compliant, E: Human Review).
- [ ] Official scrutiny disclaimer banner with clean dismiss/collapse animations.

---

### Phase 3: Tactile Document Ingestion & Upload Screen
**Focus:** Elevate `UploadScreen` with drag-and-drop feedback, file type validation, animated scanning previews, and interactive scenario starter cards.

**Files to Touch/Create:**
- Modify: `src/components/UploadScreen.tsx`
- Create: `src/components/ScenarioPresetCard.tsx` (tactile card for scenarios A–E with status preview)
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] Smooth drag-and-drop zone with animated border dashes and hover glow states.
- [ ] Scenario selector cards displaying institutional metadata, annexures count, and expected test paths.
- [ ] Instant transition into the execution pipeline upon file selection.

---

### Phase 4: Sequential Pipeline Screen & Live Streaming Panels
**Focus:** Choreograph the 4-stage sequential scrutiny pipeline (OCR → Template Gate → Authenticity → Compliance) with animated progress bars, pulsing status chips, and real-time streaming logs.

**Files to Touch/Create:**
- Modify: `src/components/PipelineScreen.tsx`
- Create: `src/components/StreamingAgentLog.tsx` (virtualized/animated streaming agent activity entries)
- Create: `src/components/ApiInspectorDrawer.tsx` (collapsible, syntax-highlighted HTTP request/response log viewer)
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] Progressive step-by-step stage animations respecting gate stops (halt at Stage 2 for B, flag at Stage 3 for C).
- [ ] RAG semantic search visualization showing query embedding, ChromaDB top-3 passage retrieval, and cosine similarity gauges.
- [ ] Real-time autoscrolling Agent Activity stream and collapsible API inspector.

---

### Phase 5: Document Specimen Viewer & Bounding Box Synchronizer
**Focus:** Build an interactive split-view document preview with synchronized hover states, animated bounding box spotlights, and multi-annexure page tabs.

**Files to Touch/Create:**
- Modify: `src/components/DocumentSpecimen.tsx`
- Modify: `src/components/PdfSnippetModal.tsx`
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] Zoom/pan controls and clean multi-annexure tab selector (Annexure 1: Trust Deed, Annexure 4: Fire NOC, Annexure 8: Geotagged Photos).
- [ ] Interactive SVG bounding box overlays highlighting the active field on hover or click.
- [ ] Forensic inspection overlay for Scenario C displaying ELA compression heatmaps and perceptual hash collision badges.
- [ ] Regulatory citation modal with PDF page extracts and rule references (`APH-6.1`, `APH-5.1`, `APH-1.1`).

---

### Phase 6: Field Validation Cards, Spring Transitions & Auto-Fix Animations
**Focus:** Refactor `FieldValidationCard` and `ReviewDashboardScreen` with spring-based red-to-green transitions (`animate`), expandable rule details, inline value editors, and batch auto-fix animations.

**Files to Touch/Create:**
- Modify: `src/components/FieldValidationCard.tsx`
- Modify: `src/components/ReviewDashboardScreen.tsx`
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] 10 Field Validation Cards with clear green/red/amber status indicators, handbook section chips, and inline captions.
- [ ] Smooth spring transition when editing a field or triggering **Re-verify** / **Auto-Fix All Wrong Fields** (red border smoothly morphs to green, error badge resolves to checkmark).
- [ ] Interactive `(i)` citation popovers displaying handbook clauses, why it failed, and suggested corrections.
- [ ] Human Review tagging checkbox ("Mark for SHC Committee Review") with instant state sync.

---

### Phase 7: Officer Decision Workflows, Audit Reports & Performance Polish
**Focus:** Complete the end-to-end scrutiny sign-off workflow with toast notifications (`Sonner`), printable audit certificates (`ReportScreen`), and 60fps frame-rate optimization.

**Files to Touch/Create:**
- Modify: `src/components/ReportScreen.tsx`
- Modify: `src/components/HistoryScreen.tsx`
- Modify: `src/App.tsx` (add Sonner `Toaster` provider)
- *Untouched:* `src/mock/*`, `src/types.ts`

**Deliverables:**
- [ ] Officer sign-off action bar (`Approve Dossier`, `Request Rectification`, `Escalate to Hearing Committee`) with confirmation toasts via Sonner.
- [ ] Formal AICTE Regulatory Scrutiny Audit Certificate (`ReportScreen`) formatted for high-fidelity print/PDF export.
- [ ] Audit History screen displaying PostgreSQL relational rows, live SQL statement viewer, and timestamped officer decisions.
- [ ] Animation audit using `review-animations` and `animation-performance` to guarantee zero dropped frames on all interactive transitions.
- [ ] Full regression verification across all 5 Scenarios A–E confirming identical output to [`BASELINE.md`](./BASELINE.md).

---

## File Modification Summary

| Phase | Files to Create / Modify | Forbidden Files (Untouched) |
| :--- | :--- | :--- |
| **Phase 0** | `BASELINE.md`, `PLAN.md` | `src/mock/*`, `src/types.ts` |
| **Phase 1** | `tailwind.config.js`, `src/index.css` | `src/mock/*`, `src/types.ts` |
| **Phase 2** | `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/App.tsx` | `src/mock/*`, `src/types.ts` |
| **Phase 3** | `src/components/UploadScreen.tsx`, `src/components/ScenarioPresetCard.tsx` | `src/mock/*`, `src/types.ts` |
| **Phase 4** | `src/components/PipelineScreen.tsx`, `src/components/StreamingAgentLog.tsx`, `src/components/ApiInspectorDrawer.tsx` | `src/mock/*`, `src/types.ts` |
| **Phase 5** | `src/components/DocumentSpecimen.tsx`, `src/components/PdfSnippetModal.tsx` | `src/mock/*`, `src/types.ts` |
| **Phase 6** | `src/components/FieldValidationCard.tsx`, `src/components/ReviewDashboardScreen.tsx` | `src/mock/*`, `src/types.ts` |
| **Phase 7** | `src/components/ReportScreen.tsx`, `src/components/HistoryScreen.tsx`, `src/App.tsx` | `src/mock/*`, `src/types.ts` |
