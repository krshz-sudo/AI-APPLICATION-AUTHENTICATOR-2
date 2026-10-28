# AI Document Analyser — AICTE Scrutiny & Regulatory Compliance Portal (SIH26261)

**AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification for AICTE Scrutiny & EVC Officers**

> **PROTOTYPE SIMULATION NOTICE:** This is a frontend-only interactive prototype built with React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, and Lucide Icons for **Smart India Hackathon 2026 (PS SIH26261 — AICTE Regulation Bureau)**. All backend endpoints (`POST /api/verify`, `GET /api/applications`), orchestration agents, multi-annexure OCR extraction, visual & duplicate-photo forensic screening, issuer portal verification (DigiLocker / Affiliating University / State Fire Service), ChromaDB vector retrieval over AICTE APH 2024–27 clauses, and PostgreSQL relational tables (`applications`, `verification_results`, `audit_log`) are **SIMULATED** in the browser (`src/mock/*`). All institutional dossiers, IDs, and certificates are **SYNTHETIC**. APH 2024–27 domain rules carry an explicit `UNVERIFIED — confirm against APH 2024-27 text` indicator until verified against official handbook text.

---

## Quick Start

```bash
npm install
npm run dev
```

---

## Project Structure

- `src/types.ts` — TypeScript domain contracts for the 10 AICTE dossier fields (`institutionName`, `permanentInstituteId`, `applicationId`, `applicationType`, `courseName`, `proposedIntake`, `builtUpAreaSqm`, `landTenureYears`, `fireNocValidUntil`, `facultyStudentRatio`), authenticity indicators, issuer verification rows, and RAG compliance results.
- `src/mock/corpus.ts` — 20 AICTE regulatory guideline passages (`DEMO DATA`): 17 APH 2024–27 & visual forensic rules (marked `UNVERIFIED - confirm against APH 2024-27 text`) plus 3 `AUD-*` scrutiny audit meta-rules (`AUD-1.2`, `AUD-2.5`, `AUD-3.4`).
- `src/mock/vectorStore.ts` — Simulated `Vector DB (ChromaDB — AICTE APH 2024-27, demo)` returning top-3 handbook passages with similarity scores (`0.91` / `0.84` / `0.79`).
- `src/mock/postgres.ts` — Simulated relational PostgreSQL tables (`applications`, `verification_results`, `audit_log`) backed by an in-memory store mirrored to `localStorage` with live SQL statement logging.
- `src/mock/tools.ts` — Simulated pipeline tools (`ocrTool`, `templateTool`, `authenticityTool`, `ragRetrieveTool`, `complianceTool`, `llmExplainTool`, `dbTool`) evaluating AICTE dossier annexures (Trust Deed, Land/Lease Deed, Building Plan, Fire NOC, University Affiliation Letter, Faculty Roster, Audited Financials, Geotagged Lab Photos, Intake Declaration).
- `src/mock/orchestrator.ts` — Sequential Orchestration Agent executing the 4 stages in strict order and streaming logs to the **Agent Activity** panel.
- `src/mock/api.ts` — Simulated HTTP/JSON endpoints (`POST /api/verify`, `GET /api/applications`, `GET /api/applications/:id`) logging requests, responses, HTTP status codes (`200`/`422`), and latency to the collapsible **API Log** panel.

---

## 5 Built-in Synthetic AICTE Demo Scenarios (A–E)

1. **Scenario A — Compliant EoA Dossier (`PASSED`):** *Sahyadri Institute of Technology and Management (SYNTHETIC)*. All 10 extracted dossier fields pass template, authenticity, and APH 2024–27 compliance checks with green ticks.
2. **Scenario B — Template Gate Failure (`FAILED`):** *Aravalli College of Engineering and Research (SYNTHETIC)*. Missing `Permanent Institute ID (PID)` (`APH-1.1`) and non-`DD/MM/YYYY` `Fire & Life Safety NOC Valid Until` date (`APH-1.5`). Pipeline halts at Stage 2 (`TEMPLATE VALIDATION FAILED`); Stages 3 and 4 are marked `Skipped`.
3. **Scenario C — Authenticity Flagged (`FLAGGED`):** *Dakshin Bharat Institute of Information Technology (SYNTHETIC)*. Visual forensic screening flags an elevated risk indicator (`0.78`) on the Fire NOC expiry date/stamp region (`AUTH-2.2`) and a duplicated Computer Lab photograph perceptual hash (`AUTH-3.1`), alongside a simulated State Fire Portal mismatch. Uses strict risk-indicator phrasing, never "proof of forgery".
4. **Scenario D — APH Compliance Failure (`FAILED` — Main Demo Scenario):** *Nalanda Vishwa Engineering Academy (SYNTHETIC)*. `Faculty Count & FSR` (`18 Faculty (FSR 1:25)`, violates `APH-6.1` 1:20 ceiling) and `Fire & Life Safety NOC Valid Until` (`15/03/2024`, violates `APH-5.1` active validity requirement) render with red borders and `(i)` rule-citation popovers while the other 8 dossier fields pass with green ticks. Edit inline and click **Re-verify** (or **Auto-Fix All Wrong Fields**) to animate red-to-green transitions and update overall status to `PASSED`.
5. **Scenario E — Ambiguous Case (`REQUIRES HUMAN REVIEW`):** *Brahmaputra Frontier Polytechnic and Tech Campus (SYNTHETIC)*. Autonomous Hill Council customary land grant and conditional University Syndicate intake endorsement have no matching deterministic clause in the corpus (`APH-7.2`, `AUD-2.5`) and escalate to the AICTE Scrutiny / Standing Hearing Committee (SHC) Officer.
