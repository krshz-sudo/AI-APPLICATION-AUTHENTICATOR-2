import {
  AuthenticityResult,
  DeterministicCheck,
  FieldKey,
  FieldValidationDetail,
  RagComplianceResult,
  ScenarioId,
  VerificationRun,
} from '../types';
import { searchVectorStore, VectorSearchResult } from './vectorStore';
import { pgInsertVerificationRun, pgUpdateVerificationRun } from './postgres';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const DOSSIER_DOCUMENT_TYPES = [
  'Annexure-1: Trust / Society Registration Deed',
  'Annexure-2: Land Ownership / Registered Lease Deed',
  'Annexure-3: Building Plan & Built-Up Area Certificate',
  'Annexure-4: Fire & Life Safety NOC',
  'Annexure-5: Affiliating University Consent Letter (Format-2)',
  'Annexure-6: Certified Faculty Roster & Cadre Summary',
  'Annexure-7: Audited Financial Statements',
  'Annexure-8: Geotagged Infrastructure & Lab Photographs',
  'Annexure-9: Portal Intake & Programme Declaration',
] as const;

export const FIELD_BBOXES: Record<
  FieldKey,
  { top: number; left: number; width: number; height: number }
> = {
  institutionName: { top: 14, left: 6, width: 88, height: 8 },
  permanentInstituteId: { top: 24, left: 6, width: 42, height: 8 },
  applicationId: { top: 24, left: 52, width: 42, height: 8 },
  applicationType: { top: 34, left: 6, width: 42, height: 8 },
  courseName: { top: 34, left: 52, width: 42, height: 8 },
  proposedIntake: { top: 45, left: 6, width: 42, height: 9 },
  builtUpAreaSqm: { top: 45, left: 52, width: 42, height: 9 },
  landTenureYears: { top: 57, left: 6, width: 88, height: 8.5 },
  fireNocValidUntil: { top: 68, left: 6, width: 42, height: 9 },
  facultyStudentRatio: { top: 68, left: 52, width: 42, height: 9 },
};

export const FIELD_SOURCE_META: Record<
  FieldKey,
  { sourceDoc: string; page: number; confidence: string }
> = {
  institutionName: {
    sourceDoc: 'Annexure-1: Trust / Society Registration Deed',
    page: 1,
    confidence: '99.2%',
  },
  permanentInstituteId: {
    sourceDoc: 'Annexure-9: Portal Intake & Programme Declaration',
    page: 1,
    confidence: '99.4%',
  },
  applicationId: {
    sourceDoc: 'Annexure-9: Portal Intake & Programme Declaration',
    page: 1,
    confidence: '99.5%',
  },
  applicationType: {
    sourceDoc: 'Annexure-9: Portal Intake & Programme Declaration',
    page: 2,
    confidence: '98.9%',
  },
  courseName: {
    sourceDoc: 'Annexure-5: Affiliating University Consent Letter',
    page: 5,
    confidence: '98.7%',
  },
  proposedIntake: {
    sourceDoc: 'Annexure-5 & 9: University NOC vs. Intake Declaration',
    page: 5,
    confidence: '98.4%',
  },
  builtUpAreaSqm: {
    sourceDoc: 'Annexure-3: Building Plan & Built-Up Area Certificate',
    page: 3,
    confidence: '97.9%',
  },
  landTenureYears: {
    sourceDoc: 'Annexure-2: Land Ownership / Registered Lease Deed',
    page: 2,
    confidence: '98.1%',
  },
  fireNocValidUntil: {
    sourceDoc: 'Annexure-4: Fire & Life Safety NOC',
    page: 4,
    confidence: '97.2%',
  },
  facultyStudentRatio: {
    sourceDoc: 'Annexure-6: Certified Faculty Roster & Cadre Summary',
    page: 6,
    confidence: '98.6%',
  },
};

export const SCENARIO_META: Record<
  ScenarioId,
  {
    id: ScenarioId;
    shortLabel: string;
    title: string;
    description: string;
    defaultFileName: string;
    badgeColor: string;
  }
> = {
  A: {
    id: 'A',
    shortLabel: 'Scenario A — Compliant EoA Dossier',
    title: 'All Dossier Fields Compliant (All 4 Stages Pass)',
    description:
      'Synthetic EoA 2026-27 dossier for Sahyadri Institute of Technology & Management. All 10 extracted fields satisfy template, forensic, and APH 2024-27 norms.',
    defaultFileName: 'Dossier_EoA_2026_Sahyadri_Tech_Compliant_SYNTHETIC.pdf',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  },
  B: {
    id: 'B',
    shortLabel: 'Scenario B — Template Gate Failure',
    title: 'Template Gate Failure (Missing PID & Wrong Fire NOC Date Format)',
    description:
      'Missing Permanent Institute ID (PID) and ISO YYYY-MM-DD date on Fire NOC. Pipeline halts at Stage 2 Template Gate; downstream stages are Skipped.',
    defaultFileName: 'Dossier_Intake_Aravalli_Engg_TemplateError_SYNTHETIC.pdf',
    badgeColor: 'bg-red-500/15 text-red-700 border-red-500/30',
  },
  C: {
    id: 'C',
    shortLabel: 'Scenario C — Authenticity Flagged',
    title: 'Authenticity Flagged (Fire NOC Date Region & Duplicate Lab Photo)',
    description:
      'Forensic screening detects an elevated risk indicator on the Fire NOC expiry date stamp region and a duplicated Computer Lab photo perceptual hash.',
    defaultFileName: 'Dossier_EoA_Dakshin_Bharat_IIT_ForensicFlag_SYNTHETIC.pdf',
    badgeColor: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
  },
  D: {
    id: 'D',
    shortLabel: 'Scenario D — APH Compliance Failure (Main Demo)',
    title: 'Compliance Failure (Deficient FSR 1:25 & Expired Fire NOC)',
    description:
      'Main Demo Scenario: Faculty-Student Ratio "18 Faculty (FSR 1:25)" violates APH-6.1 (1:20 norm) and Fire NOC Valid Until "15/03/2024" violates APH-5.1. Edit inline & Re-verify to turn green.',
    defaultFileName: 'Dossier_EoA_Nalanda_Vishwa_Academy_Submission_SYNTHETIC.pdf',
    badgeColor: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  },
  E: {
    id: 'E',
    shortLabel: 'Scenario E — Ambiguous Case (Human Review)',
    title: 'Special Category Dossier — Requires Scrutiny / SHC Review',
    description:
      'Autonomous Hill Council customary land grant and conditional University Syndicate intake endorsement have no matching deterministic clause in APH 2024-27.',
    defaultFileName: 'Dossier_Special_Brahmaputra_Frontier_Provisional_SYNTHETIC.pdf',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30',
  },
};

/**
 * Evaluates a single AICTE dossier field deterministically against the mock APH 2024-27 corpus rules.
 * Ensures every error message strictly follows:
 * "<Field> is <problem> due to <Section X.Y> of <Guideline/Rule document name>, page N (Rule ID ...)"
 */
export function evaluateSingleField(
  key: FieldKey,
  rawValue: string
): FieldValidationDetail {
  const val = rawValue.trim();
  const bbox = FIELD_BBOXES[key];
  const meta = FIELD_SOURCE_META[key];

  switch (key) {
    case 'institutionName': {
      const words = val.split(/\s+/).filter(Boolean);
      const isUppercase = val === val.toUpperCase() && val.length >= 10 && words.length >= 2;
      if (isUppercase) {
        return {
          key,
          label: 'Institution Name',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter V, Clause 5.8, page 108 (Rule ID APH-5.4) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Institution Name',
        extractedValue: val || '[EMPTY]',
        expectedValue: 'NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Institution Name is missing or not formatted in standard uppercase legal entity syntax due to Chapter V, Clause 5.8 of AICTE Approval Process Handbook 2024-27, page 108 (Rule ID APH-5.4)',
        popover: {
          title: 'Institution Name format or entity match is non-compliant',
          extractedValue: val || '[EMPTY]',
          expectedValue: 'NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)',
          why: "Institution Name is non-compliant as per Chapter V, Clause 5.8 (Institution & Sponsoring Trust Name Consistency Across Annexures) of 'AICTE Approval Process Handbook 2024-27', page 108, Rule ID APH-5.4 [UNVERIFIED - confirm against APH 2024-27 text]. Must match the uppercase legal entity name across Trust Deed and NOCs.",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.108, Rule APH-5.4 • UNVERIFIED]',
          corpusRuleId: 'APH-5.4',
          suggestedFix:
            'Enter the full uppercase legal Institution Name matching the Sponsoring Trust Deed.',
        },
        bbox,
      };
    }

    case 'permanentInstituteId': {
      const validPid = /^1-\d{7,10}$/.test(val);
      if (validPid) {
        return {
          key,
          label: 'Permanent Institute ID (PID)',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter I, Clause 1.4, page 14 (Rule ID APH-1.1) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Permanent Institute ID (PID)',
        extractedValue: val || '[MISSING]',
        expectedValue: '1-5592509',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Permanent Institute ID (PID) is missing or malformed due to Chapter I, Clause 1.4 of AICTE Approval Process Handbook 2024-27, page 14 (Rule ID APH-1.1)',
        popover: {
          title: 'Permanent Institute ID (PID) is missing or invalid',
          extractedValue: val || '[MISSING]',
          expectedValue: '1-5592509',
          why: "Permanent Institute ID is non-compliant as per Chapter I, Clause 1.4 (Application ID & Permanent Institute ID Format) of 'AICTE Approval Process Handbook 2024-27', page 14, Rule ID APH-1.1 [UNVERIFIED - confirm against APH 2024-27 text]. Must follow the 1-NNNNNNN portal identifier syntax.",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.14, Rule APH-1.1 • UNVERIFIED]',
          corpusRuleId: 'APH-1.1',
          suggestedFix:
            'Enter the 1-prefixed Permanent Institute ID assigned on the AICTE portal (e.g., 1-5592509).',
        },
        bbox,
      };
    }

    case 'applicationId': {
      const validAppId = /^1-\d{10,11}$/.test(val);
      if (validAppId) {
        return {
          key,
          label: 'AICTE Application ID',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter I, Clause 1.4, page 14 (Rule ID APH-1.1) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'AICTE Application ID',
        extractedValue: val || '[MISSING]',
        expectedValue: '1-44642983297',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'AICTE Application ID is malformed due to Chapter I, Clause 1.4 of AICTE Approval Process Handbook 2024-27, page 14 (Rule ID APH-1.1)',
        popover: {
          title: 'AICTE Application ID format is invalid',
          extractedValue: val || '[MISSING]',
          expectedValue: '1-44642983297',
          why: "AICTE Application ID is non-compliant as per Chapter I, Clause 1.4 (Application ID & Permanent Institute ID Format) of 'AICTE Approval Process Handbook 2024-27', page 14, Rule ID APH-1.1 [UNVERIFIED - confirm against APH 2024-27 text]. Must follow 1-NNNNNNNNNNN.",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.14, Rule APH-1.1 • UNVERIFIED]',
          corpusRuleId: 'APH-1.1',
          suggestedFix: 'Format AICTE Application ID as 1- followed by 10–11 digits.',
        },
        bbox,
      };
    }

    case 'applicationType': {
      if (val.length >= 5 && !val.includes('[MISSING]')) {
        return {
          key,
          label: 'Application Type',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Annexure-13, Clause 1.9, page 21 (Rule ID APH-1.3) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Application Type',
        extractedValue: val || '[MISSING]',
        expectedValue: 'Extension of Approval (EoA 2026-27)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Application Type is missing due to Annexure-13, Clause 1.9 of AICTE Approval Process Handbook 2024-27, page 21 (Rule ID APH-1.3)',
        popover: {
          title: 'Application Type declaration is missing',
          extractedValue: val || '[MISSING]',
          expectedValue: 'Extension of Approval (EoA 2026-27)',
          why: "Application Type is required under Annexure-13, Clause 1.9 of 'AICTE Approval Process Handbook 2024-27', page 21, Rule ID APH-1.3 [UNVERIFIED - confirm against APH 2024-27 text].",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.21, Rule APH-1.3 • UNVERIFIED]',
          corpusRuleId: 'APH-1.3',
          suggestedFix:
            'Specify a valid APH category (e.g., Extension of Approval (EoA 2026-27) or Increase in Intake).',
        },
        bbox,
      };
    }

    case 'courseName': {
      if (val.length >= 4 && !val.includes('[MISSING]')) {
        return {
          key,
          label: 'Programme & Course Name',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter II, Clause 2.6, page 42 (Rule ID APH-2.1) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Programme & Course Name',
        extractedValue: val || '[MISSING]',
        expectedValue: 'B.Tech — Computer Science & Engineering',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Programme & Course Name is missing due to Chapter II, Clause 2.6 of AICTE Approval Process Handbook 2024-27, page 42 (Rule ID APH-2.1)',
        popover: {
          title: 'Programme & Course Name is missing',
          extractedValue: val || '[MISSING]',
          expectedValue: 'B.Tech — Computer Science & Engineering',
          why: "Course title is required under Chapter II, Clause 2.6 of 'AICTE Approval Process Handbook 2024-27', page 42, Rule ID APH-2.1 [UNVERIFIED - confirm against APH 2024-27 text].",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.42, Rule APH-2.1 • UNVERIFIED]',
          corpusRuleId: 'APH-2.1',
          suggestedFix: 'Specify the approved AICTE programme and course title.',
        },
        bbox,
      };
    }

    case 'proposedIntake': {
      if (
        val.toUpperCase().includes('PROVISIONAL') ||
        val.toUpperCase().includes('SYNDICATE')
      ) {
        return {
          key,
          label: 'Approved / Proposed Intake',
          extractedValue: val,
          ...meta,
          status: 'warning',
          inlineCaption:
            'No matching rule found in the reference documents for conditional Syndicate intake ratification. Requires human review.',
          bbox,
        };
      }
      const numMatch = /\b(\d+)\b/.exec(val);
      const seats = numMatch ? parseInt(numMatch[1], 10) : 0;
      const isMultipleOf60 = seats > 0 && seats % 60 === 0 && seats <= 360;
      const hasMismatch = val.toLowerCase().includes('mismatch');
      if (isMultipleOf60 && !hasMismatch) {
        return {
          key,
          label: 'Approved / Proposed Intake',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter II, Clause 2.11, page 49 (Rule ID APH-2.4) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Approved / Proposed Intake',
        extractedValue: val || '[MISSING]',
        expectedValue: '180 Seats (3 Divisions • Matches Univ. NOC Ref. BTU/2026/408)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Approved / Proposed Intake is not aligned with 60-seat division multiples or Affiliating University NOC due to Chapter II, Clause 2.11 of AICTE Approval Process Handbook 2024-27, page 49 (Rule ID APH-2.4)',
        popover: {
          title: 'Intake does not match 60-seat division norm or University NOC',
          extractedValue: val || '[MISSING]',
          expectedValue: '180 Seats (3 Divisions • Matches Univ. NOC Ref. BTU/2026/408)',
          why: "Proposed Intake is non-compliant as per Chapter II, Clause 2.11 (Cross-Document Intake Consistency) of 'AICTE Approval Process Handbook 2024-27', page 49, Rule ID APH-2.4 [UNVERIFIED - confirm against APH 2024-27 text]. Intake must be a multiple of 60 and match the Affiliating University NOC.",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.49, Rule APH-2.4 • UNVERIFIED]',
          corpusRuleId: 'APH-2.4',
          suggestedFix:
            'Align intake with the sanctioned multiple of 60 seats on the University Affiliation NOC.',
        },
        bbox,
      };
    }

    case 'builtUpAreaSqm': {
      const cleanDigits = val.replace(/,/g, '');
      const numMatch = /(\d+)/.exec(cleanDigits);
      const areaSqm = numMatch ? parseInt(numMatch[1], 10) : 0;
      if (areaSqm >= 10000) {
        return {
          key,
          label: 'Certified Built-Up Area (sq.m)',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter III, Clause 3.2, page 64 (Rule ID APH-3.1) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Certified Built-Up Area (sq.m)',
        extractedValue: val || '[MISSING]',
        expectedValue: '13,400 sq.m (Instructional + Admin + Amenities Certified)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Certified Built-Up Area (sq.m) is below the normative campus requirement due to Chapter III, Clause 3.2 of AICTE Approval Process Handbook 2024-27, page 64 (Rule ID APH-3.1)',
        popover: {
          title: 'Certified Built-Up Area is below normative sq.m threshold',
          extractedValue: val || '[MISSING]',
          expectedValue: '13,400 sq.m (Instructional + Admin + Amenities Certified)',
          why: "Built-up area is non-compliant as per Chapter III, Clause 3.2 (Normative Instructional, Administrative & Amenities Built-Up Area) of 'AICTE Approval Process Handbook 2024-27', page 64, Rule ID APH-3.1 [UNVERIFIED - confirm against APH 2024-27 text].",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.64, Rule APH-3.1 • UNVERIFIED]',
          corpusRuleId: 'APH-3.1',
          suggestedFix:
            'Provide updated Occupancy / Architect Certificate meeting normative sq.m requirements.',
        },
        bbox,
      };
    }

    case 'landTenureYears': {
      if (
        val.toLowerCase().includes('hill council') ||
        val.toLowerCase().includes('customary') ||
        val.toLowerCase().includes('transitional')
      ) {
        return {
          key,
          label: 'Land Ownership / Lease Tenure',
          extractedValue: val,
          ...meta,
          status: 'needs_review',
          inlineCaption:
            'No matching rule found in the reference documents for Autonomous Hill Council customary land grant. Requires human review.',
          bbox,
        };
      }
      const isFreehold = val.toLowerCase().includes('freehold');
      const yrMatch = /(\d+)\s*year/i.exec(val);
      const leaseYears = yrMatch ? parseInt(yrMatch[1], 10) : 0;
      if (isFreehold || leaseYears >= 30) {
        return {
          key,
          label: 'Land Ownership / Lease Tenure',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter III, Clause 4.2, page 85 (Rule ID APH-4.1) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Land Ownership / Lease Tenure',
        extractedValue: val || '[MISSING]',
        expectedValue: '35 Years Registered Lease Deed (Contiguous 6.2 Acres)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Land Ownership / Lease Tenure is below the minimum 30-year registered lease requirement due to Chapter III, Clause 4.2 of AICTE Approval Process Handbook 2024-27, page 85 (Rule ID APH-4.1)',
        popover: {
          title: 'Land lease tenure is less than 30 years',
          extractedValue: val || '[MISSING]',
          expectedValue: '35 Years Registered Lease Deed (Contiguous 6.2 Acres)',
          why: "Land tenure is non-compliant as per Chapter III, Clause 4.2 (Land Ownership or Minimum 30-Year Registered Lease Norm) of 'AICTE Approval Process Handbook 2024-27', page 85, Rule ID APH-4.1 [UNVERIFIED - confirm against APH 2024-27 text].",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.85, Rule APH-4.1 • UNVERIFIED]',
          corpusRuleId: 'APH-4.1',
          suggestedFix:
            'Submit Freehold title deed or Registered Lease Deed with >= 30 years tenure.',
        },
        bbox,
      };
    }

    case 'fireNocValidUntil': {
      const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(val);
      if (!match) {
        return {
          key,
          label: 'Fire & Life Safety NOC Valid Until',
          extractedValue: val || '[MISSING]',
          expectedValue: '15/04/2028',
          ...meta,
          status: 'wrong',
          inlineCaption:
            'Fire & Life Safety NOC Valid Until is not formatted in DD/MM/YYYY syntax due to Chapter I, Clause 1.12 of AICTE Approval Process Handbook 2024-27, page 26 (Rule ID APH-1.5)',
          popover: {
            title: 'Fire Safety NOC date format is non-compliant',
            extractedValue: val || '[MISSING]',
            expectedValue: '15/04/2028',
            why: "Statutory date format is invalid as per Chapter I, Clause 1.12 (Standardized Statutory Date Format DD/MM/YYYY) of 'AICTE Approval Process Handbook 2024-27', page 26, Rule ID APH-1.5 [UNVERIFIED - confirm against APH 2024-27 text]. Dates must use DD/MM/YYYY with forward slashes.",
            sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.26, Rule APH-1.5 • UNVERIFIED]',
            corpusRuleId: 'APH-1.5',
            suggestedFix: 'Convert Fire NOC expiry date to DD/MM/YYYY format (e.g., 15/04/2028).',
          },
          bbox,
        };
      }

      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      // Scrutiny verification date is Oct 2026
      const isFuture =
        year > 2026 || (year === 2026 && (month > 10 || (month === 10 && day > 28)));
      if (isFuture) {
        return {
          key,
          label: 'Fire & Life Safety NOC Valid Until',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Chapter V, Clause 5.3, page 102 (Rule ID APH-5.1) [UNVERIFIED]',
          bbox,
        };
      }

      return {
        key,
        label: 'Fire & Life Safety NOC Valid Until',
        extractedValue: val,
        expectedValue: '15/03/2028 (Must be active on scrutiny verification date)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Fire & Life Safety NOC Valid Until is expired at the time of scrutiny due to Chapter V, Clause 5.3 of AICTE Approval Process Handbook 2024-27, page 102 (Rule ID APH-5.1)',
        popover: {
          title: 'Fire & Life Safety NOC has expired',
          extractedValue: val,
          expectedValue: '15/03/2028 (Must be active on scrutiny verification date)',
          why: "Fire Safety NOC validity is non-compliant as per Chapter V, Clause 5.3 (Mandatory Active Fire & Life Safety NOC Validity Window) of 'AICTE Approval Process Handbook 2024-27', page 102, Rule ID APH-5.1 [UNVERIFIED - confirm against APH 2024-27 text]. The Fire NOC cannot be expired at the time of scrutiny.",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.102, Rule APH-5.1 • UNVERIFIED]',
          corpusRuleId: 'APH-5.1',
          suggestedFix:
            'Enter the renewed State Fire Authority NOC expiry date (e.g., 15/03/2028).',
        },
        bbox,
      };
    }

    case 'facultyStudentRatio': {
      // Parse "1:XX" ratio from string like "24 Faculty — FSR 1:18" or faculty count >= 24
      const ratioMatch = /1\s*:\s*(\d+(\.\d+)?)/.exec(val);
      const facCountMatch = /^(\d+)\s*faculty/i.exec(val);
      const denominator = ratioMatch ? parseFloat(ratioMatch[1]) : 999;
      const facCount = facCountMatch ? parseInt(facCountMatch[1], 10) : 0;
      if ((denominator > 0 && denominator <= 20) || (facCount >= 24 && !ratioMatch)) {
        return {
          key,
          label: 'Faculty Count & FSR',
          extractedValue: val,
          ...meta,
          status: 'correct',
          inlineCaption:
            'Complies with AICTE Approval Process Handbook 2024-27, Annexure-5, Clause 6.2, page 119 (Rule ID APH-6.1) [UNVERIFIED]',
          bbox,
        };
      }
      return {
        key,
        label: 'Faculty Count & FSR',
        extractedValue: val || '[MISSING]',
        expectedValue: '24 Faculty — FSR 1:18 (Cadre 1:2:6 Verified)',
        ...meta,
        status: 'wrong',
        inlineCaption:
          'Faculty Count & FSR is worse than the mandatory 1:20 ceiling due to Annexure-5, Clause 6.2 of AICTE Approval Process Handbook 2024-27, page 119 (Rule ID APH-6.1)',
        popover: {
          title: 'Faculty-Student Ratio (FSR) violates 1:20 norm',
          extractedValue: val || '[MISSING]',
          expectedValue: '24 Faculty — FSR 1:18 (Cadre 1:2:6 Verified)',
          why: "Faculty-Student Ratio is non-compliant as per Annexure-5, Clause 6.2 (Mandatory Faculty-Student Ratio FSR 1:20 Ceiling) of 'AICTE Approval Process Handbook 2024-27', page 119, Rule ID APH-6.1 [UNVERIFIED - confirm against APH 2024-27 text]. UG Engineering programmes must maintain FSR no worse than 1:20.",
          sourceChipLabel: '[AICTE_APH_2024_27.pdf, p.119, Rule APH-6.1 • UNVERIFIED]',
          corpusRuleId: 'APH-6.1',
          suggestedFix:
            'Update certified regular faculty count meeting FSR <= 1:20 (e.g., 24 Faculty — FSR 1:18).',
        },
        bbox,
      };
    }
  }
}

export function buildInitialScenarioFields(
  scenarioId: ScenarioId
): FieldValidationDetail[] {
  const rawByScenario: Record<ScenarioId, Record<FieldKey, string>> = {
    A: {
      institutionName: 'SAHYADRI INSTITUTE OF TECHNOLOGY AND MANAGEMENT (SYNTHETIC)',
      permanentInstituteId: '1-4829104',
      applicationId: '1-44642983101',
      applicationType: 'Extension of Approval (EoA 2026-27)',
      courseName: 'B.Tech — Computer Science & Engineering',
      proposedIntake: '180 Seats (3 Divisions • Matches Univ. NOC Ref. VTU/2026/114)',
      builtUpAreaSqm: '14,850 sq.m (Instructional + Admin + Amenities Certified)',
      landTenureYears: 'Freehold — Trust Owned (Contiguous 7.5 Acres, NA Converted)',
      fireNocValidUntil: '30/06/2028',
      facultyStudentRatio: '36 Faculty (FSR 1:15 • Cadre 1:2:6 Verified)',
    },
    B: {
      institutionName: 'ARAVALLI COLLEGE OF ENGINEERING AND RESEARCH (SYNTHETIC)',
      permanentInstituteId: '[MISSING]',
      applicationId: '1-44642983192',
      applicationType: 'Increase in Intake (2026-27)',
      courseName: 'B.Tech — Electronics & Communication Engineering',
      proposedIntake: '120 Seats (2 Divisions • Matches Univ. NOC Ref. RTU/2026/309)',
      builtUpAreaSqm: '12,600 sq.m (Architect & OC Certified)',
      landTenureYears: '35 Years Registered Lease Deed (Contiguous 6.0 Acres)',
      fireNocValidUntil: '2028-04-15',
      facultyStudentRatio: '24 Faculty (FSR 1:18 • Cadre 1:2:6 Verified)',
    },
    C: {
      institutionName: 'DAKSHIN BHARAT INSTITUTE OF INFORMATION TECHNOLOGY (SYNTHETIC)',
      permanentInstituteId: '1-6193058',
      applicationId: '1-44642983245',
      applicationType: 'Extension of Approval (EoA 2026-27)',
      courseName: 'B.Tech — Artificial Intelligence & Data Science',
      proposedIntake: '180 Seats (3 Divisions • Matches Univ. NOC Ref. KTU/2026/512)',
      builtUpAreaSqm: '15,200 sq.m (Municipal OC Certified)',
      landTenureYears: 'Freehold — Society Owned (Contiguous 8.1 Acres)',
      fireNocValidUntil: '14/06/2028',
      facultyStudentRatio: '32 Faculty (FSR 1:16 • Cadre 1:2:6 Verified)',
    },
    D: {
      institutionName: 'NALANDA VISHWA ENGINEERING ACADEMY (SYNTHETIC)',
      permanentInstituteId: '1-5592509',
      applicationId: '1-44642983297',
      applicationType: 'Extension of Approval (EoA 2026-27)',
      courseName: 'B.Tech — Computer Science & Engineering',
      proposedIntake: '180 Seats (3 Divisions • Matches Univ. NOC Ref. BTU/2026/408)',
      builtUpAreaSqm: '13,400 sq.m (Instructional + Admin + Amenities Certified)',
      landTenureYears: '35 Years Registered Lease Deed (Contiguous 6.2 Acres)',
      fireNocValidUntil: '15/03/2024',
      facultyStudentRatio: '18 Faculty (FSR 1:25)',
    },
    E: {
      institutionName: 'BRAHMAPUTRA FRONTIER POLYTECHNIC AND TECH CAMPUS (SYNTHETIC)',
      permanentInstituteId: '1-8904112',
      applicationId: '1-44642983388',
      applicationType: 'EoA with Special Regional Provision (2026-27)',
      courseName: 'B.Tech — Civil & Hill Infrastructure Engineering',
      proposedIntake: 'PROVISIONAL-120-SEATS (Subject to University Syndicate Ratification)',
      builtUpAreaSqm: '11,900 sq.m (PWD Structural & Area Certified)',
      landTenureYears:
        'Autonomous Hill Council Customary Land Grant — 90-Day Transitional Conversion',
      fireNocValidUntil: '31/12/2027',
      facultyStudentRatio: '22 Faculty (FSR 1:18 • Cadre 1:2:6 Verified)',
    },
  };

  const orderedKeys: FieldKey[] = [
    'institutionName',
    'permanentInstituteId',
    'applicationId',
    'applicationType',
    'courseName',
    'proposedIntake',
    'builtUpAreaSqm',
    'landTenureYears',
    'fireNocValidUntil',
    'facultyStudentRatio',
  ];

  const raw = rawByScenario[scenarioId];
  return orderedKeys.map((k) => evaluateSingleField(k, raw[k]));
}

/**
 * 1. ocrTool (SIMULATED)
 */
export async function ocrTool(scenarioId: ScenarioId): Promise<{
  fields: FieldValidationDetail[];
  latencyMs: number;
}> {
  const latencyMs = 740 + Math.floor(Math.random() * 220);
  await delay(latencyMs);
  return {
    fields: buildInitialScenarioFields(scenarioId),
    latencyMs,
  };
}

/**
 * 2. templateTool (SIMULATED)
 * Checks mandatory dossier fields per application type + portal ID formats + DD/MM/YYYY date format.
 */
export async function templateTool(
  scenarioId: ScenarioId,
  fields: FieldValidationDetail[]
): Promise<{
  passed: boolean;
  failedFields: FieldKey[];
  summary: string;
  latencyMs: number;
}> {
  const latencyMs = 680 + Math.floor(Math.random() * 200);
  await delay(latencyMs);

  const failedFields: FieldKey[] = [];
  for (const f of fields) {
    if (
      (f.key === 'permanentInstituteId' ||
        f.key === 'applicationId' ||
        f.key === 'applicationType') &&
      f.status === 'wrong'
    ) {
      failedFields.push(f.key);
    }
    if (
      f.key === 'fireNocValidUntil' &&
      !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(f.extractedValue.trim())
    ) {
      failedFields.push(f.key);
    }
  }

  if (scenarioId === 'B' || failedFields.length > 0) {
    return {
      passed: false,
      failedFields,
      summary:
        'TEMPLATE VALIDATION FAILED: Mandatory AICTE dossier gate halted pipeline due to missing Permanent Institute ID (Rule APH-1.1) and non-DD/MM/YYYY Fire NOC date format (Rule APH-1.5). Downstream stages skipped.',
      latencyMs,
    };
  }

  return {
    passed: true,
    failedFields: [],
    summary:
      'All 9 mandatory AICTE Scrutiny Dossier annexures, portal IDs (1-NNNNNNN), and DD/MM/YYYY date formats verified.',
    latencyMs,
  };
}

/**
 * 3. authenticityTool (SIMULATED GAN/ELA document screening + duplicate photo hash + Issuer Verification row)
 */
export async function authenticityTool(scenarioId: ScenarioId): Promise<{
  result: AuthenticityResult;
  latencyMs: number;
}> {
  const latencyMs = 780 + Math.floor(Math.random() * 240);
  await delay(latencyMs);

  if (scenarioId === 'C') {
    return {
      latencyMs,
      result: {
        passed: false,
        status: 'FLAGGED / REQUIRES REVIEW',
        riskLevel: 'Elevated Risk Indicator',
        riskScoreNormalized: '0.78 (Elevated Risk Indicator)',
        llmExplanation:
          'Simulated GAN/ELA document screening identified localized high-frequency compression residuals around the "Valid Until" date box and issuing seal on Annexure-4 (Fire Safety NOC), alongside a perceptual hash collision (pHash Δ=2) indicating a reused Computer Lab photograph in Annexure-8. Note: Visual and photo-hash screening is a risk indicator, not proof of forgery, and does not replace cryptographic or issuing-authority verification. Scrutiny Officer review is required.',
        indicators: [
          {
            id: 'ind-noc-date',
            label: 'Fire NOC Date & Stamp Region Residual (Annexure-4)',
            finding:
              'Localized luminance & ELA compression shift detected around "Valid Until: 14/06/2028" date box and issuing seal (Rule AUTH-2.2 risk indicator).',
            severity: 'high',
            regionBbox: { top: 68, left: 6, width: 42, height: 9 },
          },
          {
            id: 'ind-lab-photo',
            label: 'Geotagged Lab Photo Perceptual Hash (Annexure-8)',
            finding:
              'Duplicate image block (pHash distance = 2) detected between AI/DS Lab-2 photo and prior year submission (Rule AUTH-3.1 risk indicator).',
            severity: 'elevated',
            regionBbox: { top: 80, left: 52, width: 42, height: 12 },
          },
          {
            id: 'ind-font',
            label: 'Building Plan & Land Deed Typography (Annexures 2 & 3)',
            finding:
              'Glyph kerning and scan substrate across Land Deed and Occupancy Certificate remain uniform.',
            severity: 'low',
          },
        ],
        issuerVerification: [
          {
            source: 'State Fire Service Portal / DigiLocker (SIMULATED)',
            documentChecked: 'Annexure-4: Fire Safety NOC #KL-FRS-2024-881',
            referenceId: 'DL-FIRE-KL-88109',
            status: 'MISMATCH / MANUAL CHECK (SIMULATED)',
            detail:
              'Portal expiry date lookup returned 14/06/2025 vs. scanned document 14/06/2028 — requires Scrutiny Officer verification.',
          },
          {
            source: 'Affiliating University Registry (SIMULATED)',
            documentChecked: 'Annexure-5: University Affiliation NOC (Format-2)',
            referenceId: 'KTU/AFF/2026/512',
            status: 'VERIFIED (SIMULATED)',
            detail: 'Sanctioned intake (180 seats) matches university registry snapshot.',
          },
        ],
      },
    };
  }

  return {
    latencyMs,
    result: {
      passed: true,
      status: 'PASSED',
      riskLevel: 'Low Risk Indicator',
      riskScoreNormalized: '0.12 (Low Risk Indicator)',
      llmExplanation:
        'Simulated GAN/ELA visual screening found uniform substrate compression across all statutory certificates (Fire NOC, Building Occupancy Certificate, Lease Deed) and unique perceptual hashes across all geotagged laboratory photos in Annexure-8. Note: Visual screening is a risk indicator, not proof of forgery, and is separate from issuer portal verification.',
      indicators: [
        {
          id: 'ind-noc-ok',
          label: 'Fire NOC & Seal Substrate Continuity (Annexure-4)',
          finding:
            'Uniform compression noise and continuous glyph luminance across date and official stamp regions.',
          severity: 'low',
        },
        {
          id: 'ind-photo-ok',
          label: 'Geotagged Lab & Building Photo Hashing (Annexure-8)',
          finding:
            'No duplicate or reused perceptual image hashes detected across submitted campus photographs.',
          severity: 'low',
        },
      ],
      issuerVerification: [
        {
          source: 'State Fire Authority / DigiLocker Gateway (SIMULATED)',
          documentChecked: 'Annexure-4: Fire & Life Safety NOC',
          referenceId: 'DL-FIRE-2026-VERIFIED',
          status: 'VERIFIED (SIMULATED)',
          detail: 'Certificate serial and issuing authority signature metadata matched.',
        },
        {
          source: 'Affiliating University e-Affiliation Portal (SIMULATED)',
          documentChecked: 'Annexure-5: University Consent of Affiliation (Format-2)',
          referenceId: 'UNIV-NOC-2026-OK',
          status: 'VERIFIED (SIMULATED)',
          detail: 'Course name and division intake match university dispatch record.',
        },
      ],
    },
  };
}

/**
 * 4. ragRetrieveTool (SIMULATED ChromaDB vector search)
 */
export async function ragRetrieveTool(
  scenarioId: ScenarioId,
  customQuery?: string
): Promise<VectorSearchResult> {
  return searchVectorStore(scenarioId, customQuery);
}

/**
 * 5. complianceTool & 6. llmExplainTool (SIMULATED)
 */
export async function complianceTool(
  scenarioId: ScenarioId,
  fields: FieldValidationDetail[],
  vectorResult: VectorSearchResult
): Promise<{
  decisionState: 'YES' | 'NO' | 'INSUFFICIENT_EVIDENCE';
  complianceResult: RagComplianceResult;
  latencyMs: number;
}> {
  const latencyMs = 760 + Math.floor(Math.random() * 240);
  await delay(latencyMs);

  const deterministicChecks: DeterministicCheck[] = fields.map((f) => ({
    id: `det-${f.key}`,
    fieldLabel: f.label,
    checkDescription:
      f.key === 'facultyStudentRatio'
        ? 'Deterministic FSR check: Faculty-Student Ratio <= 1:20 & Cadre 1:2:6 (APH-6.1)'
        : f.key === 'fireNocValidUntil'
        ? 'Deterministic date check: Fire NOC Valid Until > Scrutiny Date (Oct 2026) (APH-5.1)'
        : f.key === 'builtUpAreaSqm'
        ? 'Deterministic area check: Certified built-up area >= 10,000 sq.m norm (APH-3.1)'
        : f.key === 'landTenureYears'
        ? 'Deterministic tenure check: Freehold or Registered Lease >= 30 years (APH-4.1)'
        : f.key === 'proposedIntake'
        ? 'Cross-document check: Multiple of 60 seats & matches University NOC (APH-2.4)'
        : 'Mandatory portal identifier & APH schema check',
    passed: f.status === 'correct',
    detail: f.inlineCaption,
  }));

  const hasWrong = fields.some((f) => f.status === 'wrong');
  const hasNeedsReview = fields.some(
    (f) => f.status === 'needs_review' || f.status === 'warning'
  );

  const llmSummary = await llmExplainTool(scenarioId, fields);

  if (hasWrong) {
    return {
      decisionState: 'NO',
      latencyMs,
      complianceResult: {
        status: 'NON-COMPLIANT / REQUIRES CORRECTION',
        queryBuilt: vectorResult.queryText,
        embeddingVectorPreview: vectorResult.embeddingPreview,
        retrievedPassages: vectorResult.topK,
        deterministicChecks,
        llmEvaluationSummary: llmSummary,
      },
    };
  }

  if (hasNeedsReview || scenarioId === 'E') {
    return {
      decisionState: 'INSUFFICIENT_EVIDENCE',
      latencyMs,
      complianceResult: {
        status: 'REQUIRES HUMAN REVIEW',
        queryBuilt: vectorResult.queryText,
        embeddingVectorPreview: vectorResult.embeddingPreview,
        retrievedPassages: vectorResult.topK,
        deterministicChecks,
        llmEvaluationSummary: llmSummary,
      },
    };
  }

  return {
    decisionState: 'YES',
    latencyMs,
    complianceResult: {
      status: 'PASSED',
      queryBuilt: vectorResult.queryText,
      embeddingVectorPreview: vectorResult.embeddingPreview,
      retrievedPassages: vectorResult.topK,
      deterministicChecks,
      llmEvaluationSummary: llmSummary,
    },
  };
}

/**
 * 6. llmExplainTool (SIMULATED)
 */
export async function llmExplainTool(
  scenarioId: ScenarioId,
  fields: FieldValidationDetail[]
): Promise<string> {
  await delay(300);
  const wrongFields = fields.filter((f) => f.status === 'wrong');
  const reviewFields = fields.filter(
    (f) => f.status === 'needs_review' || f.status === 'warning'
  );

  if (wrongFields.length > 0) {
    const reasons = wrongFields.map((f) => `${f.label} (${f.extractedValue})`).join(', ');
    return `Combined deterministic rule checks and retrieved AICTE APH 2024-27 clauses indicate non-compliance on ${wrongFields.length} dossier parameter(s): ${reasons}. Vector similarity retrieved relevant handbook clauses (APH-6.1, APH-5.1, APH-2.4), and deterministic evaluation confirmed deficiencies requiring institutional rectification or inline Scrutiny Officer re-verification.`;
  }

  if (reviewFields.length > 0 || scenarioId === 'E') {
    return `Semantic retrieval against the 20-entry AICTE APH 2024-27 corpus yielded no deterministic rule governing Autonomous Hill Council customary land grants or conditional University Syndicate intake ratifications (Rules APH-7.2, AUD-2.5). Automated decision withheld; escalated to Scrutiny / Standing Hearing Committee (SHC) Officer.`;
  }

  return `All ${fields.length} extracted dossier fields satisfy deterministic APH norms (FSR <= 1:20, active Fire Safety NOC, certified built-up area, land tenure, and cross-document university intake consistency) and align with retrieved clauses (APH-6.1, APH-5.1, APH-3.1). Dossier is verified within the scope of checks performed.`;
}

/**
 * 7. dbTool (SIMULATED PostgreSQL persistence)
 */
export async function dbTool(
  action: 'insert' | 'update',
  run: VerificationRun,
  auditNote = 'Automated scrutiny pipeline completion'
): Promise<VerificationRun> {
  if (action === 'insert') {
    return pgInsertVerificationRun(run);
  }
  return pgUpdateVerificationRun(run, auditNote);
}
