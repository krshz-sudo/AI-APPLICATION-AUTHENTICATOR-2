# AI Document Analyser — Scenarios A–E Verification Baseline

**Project:** AI Document Analyser — AICTE Scrutiny & Regulatory Compliance Portal (SIH26261)  
**Branch:** `feat/ui-motion-auth` (isolated worktree)  
**Date:** October 30, 2026  
**Environment:** React 18, Vite 5.4.21, TypeScript 5.6.2, Tailwind CSS 3.4.15, Framer Motion 11.11.17  
**Execution Context:** Clean baseline recorded prior to any feature edits. All backend engines and tables simulated in `src/mock/*` (frozen).

---

## Executive Summary Matrix

| Scenario | Title / Target Institution | Overall Status | Field Status Counts (Green / Red / Amber) | Pipeline Stages (OCR → Template → Auth → RAG) | API Status & Latency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | Compliant EoA Dossier (*Sahyadri Institute*) | `PASSED` | 10 Green / 0 Red / 0 Amber | `passed` → `passed` → `passed` → `passed` | HTTP 200 (~2420ms) |
| **B** | Template Gate Failure (*Aravalli College*) | `FAILED` | 8 Green / 2 Red / 0 Amber | `passed` → `failed` → `skipped` → `skipped` | HTTP 422 (~1680ms) |
| **C** | Authenticity Flagged (*Dakshin Bharat Tech*) | `FLAGGED` | 10 Green / 0 Red / 0 Amber | `passed` → `passed` → `flagged` → `skipped` | HTTP 200 (~2290ms) |
| **D** | APH Compliance Failure (*Nalanda Vishwa*) | `FAILED` | 8 Green / 2 Red / 0 Amber | `passed` → `passed` → `passed` → `failed` | HTTP 422 (~2410ms) |
| **E** | Ambiguous Case (*Brahmaputra Frontier*) | `REQUIRES HUMAN REVIEW` | 8 Green / 0 Red / 2 Amber | `passed` → `passed` → `passed` → `needs_review` | HTTP 200 (~2350ms) |

---

## Detailed Scenario Baseline Reports

### Scenario A — Compliant EoA Dossier
- **Institution Name:** `SAHYADRI INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SYNTHETIC)`
- **Application ID:** `1-44642983101` | **PID:** `1-4829104`
- **Submission Dossier:** `Dossier_EoA_Sahyadri_Institute_Submission_SYNTHETIC.pdf` (2.84 MB)
- **Overall Status:** `PASSED`
- **Status Banner:** `PASSED - Institution dossier verified within the scope of checks performed.`
- **Field Breakdown (10 of 10 Green):**
  1. `institutionName`: `SAHYADRI INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SYNTHETIC)` — **Green (correct)**
  2. `permanentInstituteId`: `1-4829104` — **Green (correct)**
  3. `applicationId`: `1-44642983101` — **Green (correct)**
  4. `applicationType`: `Extension of Approval (EoA 2026-27)` — **Green (correct)**
  5. `courseName`: `B.Tech - Computer Science & Engineering` — **Green (correct)**
  6. `proposedIntake`: `180 Seats (3 Divisions • Matches Univ. NOC Ref. VTU/2026/114)` — **Green (correct)**
  7. `builtUpAreaSqm`: `14,850 sq.m (Instructional + Admin + Amenities Certified)` — **Green (correct)**
  8. `landTenureYears`: `Freehold - Trust Owned (Contiguous 7.5 Acres, NA Converted)` — **Green (correct)**
  9. `fireNocValidUntil`: `30/06/2028` — **Green (correct)**
  10. `facultyStudentRatio`: `36 Faculty (FSR 1:15 • Cadre 1:2:6 Verified)` — **Green (correct)**
- **Pipeline Stage Progression:**
  - **Stage 1 (OCR):** `passed` — 10 structured fields extracted across Annexures 1–9.
  - **Stage 2 (Template Gate):** `passed` — All 9 mandatory annexures present; portal PID format and DD/MM/YYYY syntax valid.
  - **Stage 3 (Authenticity):** `passed` — Risk score `0.12 (Low Risk Indicator)`. Uniform substrate noise, unique perceptual photo hashes, DigiLocker Fire NOC (`DL-FIRE-2026-VERIFIED`) and Affiliating University NOC (`UNIV-NOC-2026-OK`) verified.
  - **Stage 4 (RAG Compliance):** `passed` — Decision state `YES`. Retrieved APH clauses `APH-6.1` (p.119), `APH-5.1` (p.102), `APH-2.4` (p.49); 10 of 10 deterministic checks passed.
- **Agent Activity Log Panel:**
  - `OrchestratorAgent: Starting Stage 1: Document Input + OCR`
  - `ocrTool: OCR Extraction Completed (10 fields extracted)`
  - `templateTool: Template Gate Decision: YES (All mandatory annexures verified)`
  - `authenticityTool: Authenticity Screening: Low Risk (0.12)`
  - `ragRetrieveTool: ChromaDB Vector Retrieval (top-3 similarity: 0.91, 0.84, 0.79)`
  - `complianceTool: Compliance Decision: PASSED`
  - `dbTool: INSERT verification_results (Status: PASSED)`
- **API Log Panel:**
  - `POST /api/verify` → `200 OK` (Latency: ~2420ms)
  - Request: `{ scenarioId: "A", strictSequentialPipeline: true }`
  - Response: `{ runId: "VER-2026-90102", overallStatus: "PASSED", stages: { ocr: "passed", template: "passed", authenticity: "passed", compliance: "passed" } }`

---

### Scenario B — Template Gate Failure
- **Institution Name:** `ARAVALLI COLLEGE OF ENGINEERING AND RESEARCH (SYNTHETIC)`
- **Application ID:** `1-44642983192` | **PID:** `[MISSING]`
- **Submission Dossier:** `Dossier_Intake_Aravalli_College_Submission_SYNTHETIC.pdf` (2.84 MB)
- **Overall Status:** `FAILED`
- **Status Banner:** `TEMPLATE VALIDATION FAILED — Dossier halted at Stage 2 Gate due to missing Permanent Institute ID (APH-1.1) and invalid Fire NOC date format (APH-1.5).`
- **Field Breakdown (8 Green, 2 Red):**
  1. `institutionName`: `ARAVALLI COLLEGE OF ENGINEERING AND RESEARCH (SYNTHETIC)` — **Green (correct)**
  2. `permanentInstituteId`: `[MISSING]` — **Red (wrong)** (violates `APH-1.1` mandatory PID rule)
  3. `applicationId`: `1-44642983192` — **Green (correct)**
  4. `applicationType`: `Increase in Intake (2026-27)` — **Green (correct)**
  5. `courseName`: `B.Tech - Electronics & Communication Engineering` — **Green (correct)**
  6. `proposedIntake`: `120 Seats (2 Divisions • Matches Univ. NOC Ref. RTU/2026/309)` — **Green (correct)**
  7. `builtUpAreaSqm`: `12,600 sq.m (Architect & OC Certified)` — **Green (correct)**
  8. `landTenureYears`: `35 Years Registered Lease Deed (Contiguous 6.0 Acres)` — **Green (correct)**
  9. `fireNocValidUntil`: `2028-04-15` — **Red (wrong)** (violates `APH-1.5` standardized `DD/MM/YYYY` syntax)
  10. `facultyStudentRatio`: `24 Faculty (FSR 1:18 • Cadre 1:2:6 Verified)` — **Green (correct)**
- **Pipeline Stage Progression:**
  - **Stage 1 (OCR):** `passed` — 10 metadata fields extracted.
  - **Stage 2 (Template Gate):** `failed` — Gate Decision `NO (HALT)`. Missing mandatory PID and non-DD/MM/YYYY date syntax.
  - **Stage 3 (Authenticity):** `skipped` — Downstream execution halted.
  - **Stage 4 (RAG Compliance):** `skipped` — Downstream execution halted.
- **Agent Activity Log Panel:**
  - `OrchestratorAgent: Starting Stage 1: Document Input + OCR`
  - `ocrTool: OCR Extraction Completed (10 fields)`
  - `templateTool: Template Gate Decision: NO (HALT) — Missing permanentInstituteId, invalid fireNocValidUntil format`
  - `dbTool: INSERT verification_results (Status: FAILED, Stage: Template Gate)`
- **API Log Panel:**
  - `POST /api/verify` → `422 Unprocessable Entity` (Latency: ~1680ms)
  - Request: `{ scenarioId: "B", strictSequentialPipeline: true }`
  - Response: `{ runId: "VER-2026-90103", overallStatus: "FAILED", stages: { ocr: "passed", template: "failed", authenticity: "skipped", compliance: "skipped" } }`

---

### Scenario C — Authenticity Flagged
- **Institution Name:** `DAKSHIN BHARAT INSTITUTE OF INFORMATION TECHNOLOGY (SYNTHETIC)`
- **Application ID:** `1-44642983245` | **PID:** `1-6193058`
- **Submission Dossier:** `Dossier_EoA_Dakshin_Bharat_Tech_Submission_SYNTHETIC.pdf` (2.84 MB)
- **Overall Status:** `FLAGGED`
- **Status Banner:** `FLAGGED / REQUIRES REVIEW — Elevated risk indicator on Fire NOC date/stamp region and duplicate lab photo hash (forensic screening is a risk indicator, not proof of forgery).`
- **Field Breakdown (10 Green Data Extraction, Forensic Stage Flagged):**
  - All 10 extracted text fields (`institutionName`, `permanentInstituteId`, `applicationId`, `applicationType`, `courseName`, `proposedIntake`, `builtUpAreaSqm`, `landTenureYears`, `fireNocValidUntil`, `facultyStudentRatio`) evaluate as **Green (correct)** syntactically.
  - Authenticity screening surfaces 2 severe visual risk indicators and a portal mismatch.
- **Pipeline Stage Progression:**
  - **Stage 1 (OCR):** `passed` — 10 metadata fields extracted.
  - **Stage 2 (Template Gate):** `passed` — Mandatory fields and date formats valid.
  - **Stage 3 (Authenticity):** `flagged` — Risk score `0.78 (Elevated Risk Indicator)`. Identified localized high-frequency compression residuals around Fire NOC date box and official stamp (`AUTH-2.2`), perceptual hash collision (pHash Δ=2) on Annexure-8 AI/DS Lab photo (`AUTH-3.1`), and State Fire Service Portal mismatch (returned `14/06/2025` vs scanned `14/06/2028`).
  - **Stage 4 (RAG Compliance):** `skipped` — Downstream compliance skipped due to unresolved forensic risk indicators.
- **Agent Activity Log Panel:**
  - `OrchestratorAgent: Starting Stage 1: Document Input + OCR`
  - `ocrTool: OCR Extraction Completed (10 fields)`
  - `templateTool: Template Gate Decision: YES`
  - `authenticityTool: WARNING — Authenticity Screening Flagged: Elevated Risk Indicator (0.78). Localized ELA shift & pHash collision detected.`
  - `dbTool: INSERT verification_results (Status: FLAGGED)`
- **API Log Panel:**
  - `POST /api/verify` → `200 OK` (Latency: ~2290ms)
  - Request: `{ scenarioId: "C", strictSequentialPipeline: true }`
  - Response: `{ runId: "VER-2026-90104", overallStatus: "FLAGGED", stages: { ocr: "passed", template: "passed", authenticity: "flagged", compliance: "skipped" } }`

---

### Scenario D — APH Compliance Failure (Main Demo Scenario)
- **Institution Name:** `NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)`
- **Application ID:** `1-44642983297` | **PID:** `1-5592509`
- **Submission Dossier:** `Dossier_EoA_Nalanda_Vishwa_Academy_Submission_SYNTHETIC.pdf` (2.84 MB)
- **Overall Status:** `FAILED`
- **Status Banner:** `NON-COMPLIANT / REQUIRES CORRECTION — Faculty Count & FSR ("18 Faculty (FSR 1:25)", Rule APH-6.1) and Fire & Life Safety NOC Valid Until ("15/03/2024", Rule APH-5.1) violate AICTE APH 2024-27 norms.`
- **Field Breakdown (8 Green, 2 Red):**
  1. `institutionName`: `NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)` — **Green (correct)**
  2. `permanentInstituteId`: `1-5592509` — **Green (correct)**
  3. `applicationId`: `1-44642983297` — **Green (correct)**
  4. `applicationType`: `Extension of Approval (EoA 2026-27)` — **Green (correct)**
  5. `courseName`: `B.Tech — Computer Science & Engineering` — **Green (correct)**
  6. `proposedIntake`: `180 Seats (3 Divisions • Matches Univ. NOC Ref. BTU/2026/408)` — **Green (correct)**
  7. `builtUpAreaSqm`: `13,400 sq.m (Instructional + Admin + Amenities Certified)` — **Green (correct)**
  8. `landTenureYears`: `35 Years Registered Lease Deed (Contiguous 6.2 Acres)` — **Green (correct)**
  9. `fireNocValidUntil`: `15/03/2024` — **Red (wrong)** (expired before scrutiny date; violates Chapter V, Clause 5.3, Rule `APH-5.1`)
  10. `facultyStudentRatio`: `18 Faculty (FSR 1:25)` — **Red (wrong)** (violates Annexure-5, Clause 6.2, Rule `APH-6.1` 1:20 mandatory ceiling)
- **Pipeline Stage Progression:**
  - **Stage 1 (OCR):** `passed` — 10 structured fields extracted.
  - **Stage 2 (Template Gate):** `passed` — All mandatory annexures and date syntax valid.
  - **Stage 3 (Authenticity):** `passed` — Low Risk Indicator (`0.14`). Valid visual substrates and verified issuer records.
  - **Stage 4 (RAG Compliance):** `failed` — Decision State `NO`. Vector retrieval retrieved `APH-6.1` (FSR 1:20 ceiling), `APH-5.1` (active Fire NOC window), and `APH-2.4` (intake alignment). Deterministic checks failed on 2 fields.
- **Interactive Verification Capabilities:**
  - Clicking red `(i)` icons renders rule popovers with Handbook citations and suggested corrections.
  - Inline editing values (e.g. updating FSR to `24 Faculty (FSR 1:18)` and Fire NOC to `15/03/2028`) and clicking **Re-verify** (or **Auto-Fix All Wrong Fields**) re-evaluates the run and animates status to `PASSED`.
- **Agent Activity Log Panel:**
  - `OrchestratorAgent: Starting Stage 1: Document Input + OCR`
  - `ocrTool: OCR Extraction Completed (10 fields)`
  - `templateTool: Template Gate Decision: YES`
  - `authenticityTool: Authenticity Screening: Low Risk (0.14)`
  - `ragRetrieveTool: ChromaDB Vector Retrieval over AICTE APH 2024-27`
  - `complianceTool: Compliance Decision: NO — 2 violations detected (APH-6.1, APH-5.1)`
  - `dbTool: INSERT verification_results (Status: FAILED)`
- **API Log Panel:**
  - `POST /api/verify` → `422 Unprocessable Entity` (Latency: ~2410ms)
  - Request: `{ scenario: "D", fileName: "Dossier_EoA_Nalanda_Vishwa_Academy_Submission_SYNTHETIC.pdf" }`
  - Response: `{ runId: "VER-2026-90101", overallStatus: "FAILED", nonCompliantFields: ["facultyStudentRatio (APH-6.1)", "fireNocValidUntil (APH-5.1)"], simulated: true }`

---

### Scenario E — Ambiguous Case
- **Institution Name:** `BRAHMAPUTRA FRONTIER POLYTECHNIC AND TECH CAMPUS (SYNTHETIC)`
- **Application ID:** `1-44642983388` | **PID:** `1-8904112`
- **Submission Dossier:** `Dossier_Special_Brahmaputra_Polytechnic_Submission_SYNTHETIC.pdf` (2.84 MB)
- **Overall Status:** `REQUIRES HUMAN REVIEW`
- **Status Banner:** `REQUIRES HUMAN REVIEW — No matching deterministic rule in APH 2024-27 for Autonomous Hill Council customary land grant and conditional Syndicate intake endorsement.`
- **Field Breakdown (8 Green, 0 Red, 2 Amber):**
  1. `institutionName`: `BRAHMAPUTRA FRONTIER POLYTECHNIC AND TECH CAMPUS (SYNTHETIC)` — **Green (correct)**
  2. `permanentInstituteId`: `1-8904112` — **Green (correct)**
  3. `applicationId`: `1-44642983388` — **Green (correct)**
  4. `applicationType`: `EoA with Special Regional Provision (2026-27)` — **Green (correct)**
  5. `courseName`: `B.Tech — Civil & Hill Infrastructure Engineering` — **Green (correct)**
  6. `proposedIntake`: `PROVISIONAL-120-SEATS (Subject to University Syndicate Ratification)` — **Amber (needs_review)**
  7. `builtUpAreaSqm`: `11,900 sq.m (PWD Structural & Area Certified)` — **Green (correct)**
  8. `landTenureYears`: `Autonomous Hill Council Customary Land Grant — 90-Day Transitional Conversion` — **Amber (needs_review)**
  9. `fireNocValidUntil`: `31/12/2027` — **Green (correct)**
  10. `facultyStudentRatio`: `22 Faculty (FSR 1:18 • Cadre 1:2:6 Verified)` — **Green (correct)**
- **Pipeline Stage Progression:**
  - **Stage 1 (OCR):** `passed` — 10 metadata fields extracted.
  - **Stage 2 (Template Gate):** `passed` — Mandatory fields present.
  - **Stage 3 (Authenticity):** `passed` — Risk score `0.11 (Low Risk Indicator)`. No forensic anomalies detected.
  - **Stage 4 (RAG Compliance):** `needs_review` — Decision State `INSUFFICIENT_EVIDENCE`. Semantic search returned passages (`APH-7.2`, `AUD-2.5`), but deterministic checks yielded no rule covering Autonomous Hill Council customary land grant or provisional intake. Escalated to Scrutiny / Standing Hearing Committee (SHC) Officer.
- **Agent Activity Log Panel:**
  - `OrchestratorAgent: Starting Stage 1: Document Input + OCR`
  - `ocrTool: OCR Extraction Completed (10 fields)`
  - `templateTool: Template Gate Decision: YES`
  - `authenticityTool: Authenticity Screening: Low Risk (0.11)`
  - `ragRetrieveTool: ChromaDB Vector Retrieval over AICTE APH 2024-27`
  - `complianceTool: Compliance Decision: INSUFFICIENT_EVIDENCE — Escalated for Scrutiny / Standing Hearing Committee review`
  - `dbTool: INSERT verification_results (Status: REQUIRES HUMAN REVIEW)`
- **API Log Panel:**
  - `POST /api/verify` → `200 OK` (Latency: ~2350ms)
  - Request: `{ scenarioId: "E", strictSequentialPipeline: true }`
  - Response: `{ runId: "VER-2026-90105", overallStatus: "REQUIRES HUMAN REVIEW", stages: { ocr: "passed", template: "passed", authenticity: "passed", compliance: "needs_review" } }`

---

## Baseline Verification Checklist

- [x] Node.js dependencies installed (`npm install`) cleanly in `.worktrees/feat-ui-motion-auth`
- [x] Production build passes with zero errors: `tsc -b && vite build` (2.65s)
- [x] Vite dev server starts successfully on `http://localhost:5173/`
- [x] All 5 scenarios verified against exact domain criteria and seed state
- [x] Red/Green/Amber field mappings confirmed across all 10 domain fields
- [x] Stage skipping behaviors verified (Scenario B halts at Stage 2; Scenario C halts at Stage 3)
- [x] Streaming Agent Activity logs and API Log entries documented
- [x] `src/mock/*` and `src/types.ts` confirmed untouched and unedited
