import {
  AgentActivityLog,
  FieldKey,
  FieldValidationDetail,
  OverallStatus,
  PipelineStagesSummary,
  ScenarioId,
  VerificationRun,
} from '../types';
import {
  authenticityTool,
  buildInitialScenarioFields,
  complianceTool,
  dbTool,
  evaluateSingleField,
  ocrTool,
  ragRetrieveTool,
  SCENARIO_META,
  templateTool,
} from './tools';
import { VECTOR_DB_LABEL } from './vectorStore';

type ActivityListener = (logs: AgentActivityLog[]) => void;
const activityListeners: Set<ActivityListener> = new Set();
let activityLogs: AgentActivityLog[] = [];

function nowTimeStr(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

export function emitAgentActivity(
  entry: Omit<AgentActivityLog, 'id' | 'timestamp'>
): AgentActivityLog {
  const full: AgentActivityLog = {
    ...entry,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowTimeStr(),
  };
  activityLogs = [full, ...activityLogs].slice(0, 80);
  activityListeners.forEach((cb) => cb(activityLogs));
  return full;
}

export function subscribeAgentActivity(cb: ActivityListener): () => void {
  activityListeners.add(cb);
  cb(activityLogs);
  return () => {
    activityListeners.delete(cb);
  };
}

export function clearAgentActivity(): void {
  activityLogs = [];
  activityListeners.forEach((cb) => cb(activityLogs));
}

export interface PipelineProgressUpdate {
  stepIndex: number; // 1=OCR, 2=Template, 3=Authenticity, 4=RAG, 5=Completed
  subStepText: string;
  extractedFieldsCount: number;
  ragPhase?: 'idle' | 'query' | 'embed' | 'search' | 'evaluate' | 'done';
  partialRun: VerificationRun;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Orchestration Agent (SIMULATED)
 * Strictly executes the 4 sequential stages + DB persistence and notifies UI listeners.
 */
export async function runOrchestrationPipeline(
  scenarioId: ScenarioId,
  fileInfo: { name?: string; type?: string; size?: string },
  onProgress?: (update: PipelineProgressUpdate) => void
): Promise<VerificationRun> {
  const meta = SCENARIO_META[scenarioId];
  const runId = `VER-2026-${Math.floor(10000 + Math.random() * 89999)}`;
  const previewFields = buildInitialScenarioFields(scenarioId);
  const appId =
    previewFields.find((f) => f.key === 'applicationId')?.extractedValue ||
    `1-44642${Math.floor(100000 + Math.random() * 899999)}`;
  const nowIso = new Date().toISOString();

  const initialStages: PipelineStagesSummary = {
    ocr: {
      state: 'running',
      fieldsExtractedCount: 0,
      summary: 'Scanning AICTE institution dossier annexures and extracting metadata...',
    },
    template: {
      state: 'idle',
      decisionPassed: null,
      summary: 'Waiting for OCR completion...',
      failedFields: [],
    },
    authenticity: {
      state: 'idle',
      decisionPassed: null,
    },
    compliance: {
      state: 'idle',
      decisionState: null,
    },
  };

  const draftRun: VerificationRun = {
    id: runId,
    applicationId: appId,
    scenarioId,
    scenarioTitle: meta.title,
    fileName: fileInfo.name || meta.defaultFileName,
    fileType: fileInfo.type || 'application/pdf',
    fileSize: fileInfo.size || '2.84 MB',
    createdAt: nowIso,
    updatedAt: nowIso,
    overallStatus: 'PASSED',
    statusBannerText: 'AICTE Scrutiny verification pipeline in progress...',
    fields: [],
    stages: initialStages,
    reviewerNotes: '',
    auditTimeline: [
      {
        id: `aud-${Date.now()}-1`,
        timestamp: nowTimeStr(),
        actor: 'Orchestration Agent (Simulated)',
        action: 'Scrutiny Pipeline Initiated',
        detail: `Received institution dossier "${fileInfo.name || meta.defaultFileName}" under ${meta.shortLabel}.`,
        status: 'info',
      },
    ],
  };

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'ocrTool',
    stage: 'ocr',
    action: 'Starting Stage 1: Document Input + OCR',
    detail: `Scanning "${draftRun.fileName}" across Annexures 1–9 for institutional approval fields.`,
    durationMs: 0,
    status: 'info',
  });

  onProgress?.({
    stepIndex: 1,
    subStepText: 'Scanning AICTE dossier annexures & running optical character recognition...',
    extractedFieldsCount: 0,
    ragPhase: 'idle',
    partialRun: structuredClone(draftRun),
  });

  // STAGE 1: OCR
  const ocrRes = await ocrTool(scenarioId);
  const totalFields = ocrRes.fields.length;
  // Reveal fields one by one quickly for visual polish
  for (let i = 1; i <= totalFields; i++) {
    await delay(90);
    draftRun.fields = ocrRes.fields.slice(0, i);
    draftRun.stages.ocr.fieldsExtractedCount = i;
    onProgress?.({
      stepIndex: 1,
      subStepText: `Extracted field ${i} of ${totalFields}: ${ocrRes.fields[i - 1].label}`,
      extractedFieldsCount: i,
      ragPhase: 'idle',
      partialRun: structuredClone(draftRun),
    });
  }

  draftRun.stages.ocr.state = 'passed';
  draftRun.stages.ocr.summary = `Extracted ${totalFields} structured fields across Annexures 1–9 from "${draftRun.fileName}".`;

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'ocrTool',
    stage: 'ocr',
    action: 'OCR Extraction Completed',
    detail: `Extracted ${totalFields} fields (${ocrRes.fields.map((f) => f.label).join(', ')}).`,
    durationMs: ocrRes.latencyMs,
    status: 'success',
  });

  draftRun.auditTimeline.push({
    id: `aud-${Date.now()}-ocr`,
    timestamp: nowTimeStr(),
    actor: 'ocrTool (Simulated)',
    action: `${totalFields} Dossier Metadata Fields Extracted`,
    detail: `Completed multi-annexure bounding-box OCR in ${ocrRes.latencyMs} ms.`,
    status: 'success',
  });

  // STAGE 2: TEMPLATE VALIDATION GATE
  draftRun.stages.template.state = 'running';
  draftRun.stages.template.summary =
    'Evaluating Decision Gate: Does the dossier contain all mandatory annexures and valid ID/date syntax?';
  onProgress?.({
    stepIndex: 2,
    subStepText: 'Evaluating Template Validation Gate (mandatory annexures, PID/App ID & date syntax)...',
    extractedFieldsCount: totalFields,
    ragPhase: 'idle',
    partialRun: structuredClone(draftRun),
  });

  const tplRes = await templateTool(scenarioId, draftRun.fields);

  if (!tplRes.passed) {
    draftRun.stages.template.state = 'failed';
    draftRun.stages.template.decisionPassed = false;
    draftRun.stages.template.summary = tplRes.summary;
    draftRun.stages.template.failedFields = tplRes.failedFields;

    // Downstream stages MUST show "Skipped"
    draftRun.stages.authenticity.state = 'skipped';
    draftRun.stages.authenticity.decisionPassed = null;
    draftRun.stages.compliance.state = 'skipped';
    draftRun.stages.compliance.decisionState = null;

    draftRun.overallStatus = 'FAILED';
    draftRun.statusBannerText =
      'TEMPLATE VALIDATION FAILED — Dossier halted at Template Gate. Downstream Authenticity and RAG Compliance stages were skipped.';

    emitAgentActivity({
      agent: 'OrchestratorAgent',
      tool: 'templateTool',
      stage: 'template',
      action: 'Template Gate Decision: NO (HALT)',
      detail: tplRes.summary,
      durationMs: tplRes.latencyMs,
      status: 'error',
    });

    draftRun.auditTimeline.push({
      id: `aud-${Date.now()}-tpl-fail`,
      timestamp: nowTimeStr(),
      actor: 'templateTool (Simulated)',
      action: 'Template Validation Gate: FAILED',
      detail: tplRes.summary,
      status: 'error',
    });

    await dbTool('insert', draftRun, 'Template validation gate failed');
    onProgress?.({
      stepIndex: 5,
      subStepText: 'Pipeline halted at Template Gate. Report ready.',
      extractedFieldsCount: totalFields,
      ragPhase: 'idle',
      partialRun: structuredClone(draftRun),
    });
    return draftRun;
  }

  draftRun.stages.template.state = 'passed';
  draftRun.stages.template.decisionPassed = true;
  draftRun.stages.template.summary = tplRes.summary;

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'templateTool',
    stage: 'template',
    action: 'Template Gate Decision: YES (Continue)',
    detail: tplRes.summary,
    durationMs: tplRes.latencyMs,
    status: 'success',
  });

  draftRun.auditTimeline.push({
    id: `aud-${Date.now()}-tpl-ok`,
    timestamp: nowTimeStr(),
    actor: 'templateTool (Simulated)',
    action: 'Template Validation Gate: PASSED',
    detail: tplRes.summary,
    status: 'success',
  });

  // STAGE 3: AUTHENTICITY ANALYSIS
  draftRun.stages.authenticity.state = 'running';
  onProgress?.({
    stepIndex: 3,
    subStepText:
      'Running visual risk indicator analysis on NOC date/stamp regions and duplicate photo hashing...',
    extractedFieldsCount: totalFields,
    ragPhase: 'idle',
    partialRun: structuredClone(draftRun),
  });

  const authRes = await authenticityTool(scenarioId);
  draftRun.stages.authenticity.result = authRes.result;

  if (!authRes.result.passed) {
    draftRun.stages.authenticity.state = 'flagged';
    draftRun.stages.authenticity.decisionPassed = false;
    // Decision diamond NO -> FLAGGED / REQUIRES REVIEW
    draftRun.stages.compliance.state = 'skipped';
    draftRun.stages.compliance.decisionState = null;
    draftRun.overallStatus = 'FLAGGED';
    draftRun.statusBannerText =
      'FLAGGED / REQUIRES REVIEW — Visual risk indicator detected on Fire NOC date/stamp region and duplicate lab photo hash (forensic screening is a risk indicator, not proof of forgery).';

    emitAgentActivity({
      agent: 'OrchestratorAgent',
      tool: 'authenticityTool',
      stage: 'authenticity',
      action: 'Authenticity Gate Decision: NO (FLAGGED / REQUIRES REVIEW)',
      detail: `Risk indicator: ${authRes.result.riskScoreNormalized}. Fire NOC date region & Annexure-8 lab photo hash flagged for officer inspection.`,
      durationMs: authRes.latencyMs,
      status: 'warning',
    });

    draftRun.auditTimeline.push({
      id: `aud-${Date.now()}-auth-flag`,
      timestamp: nowTimeStr(),
      actor: 'authenticityTool (Simulated)',
      action: 'Authenticity Analysis: FLAGGED / REQUIRES REVIEW',
      detail: authRes.result.llmExplanation,
      status: 'warning',
    });

    await dbTool('insert', draftRun, 'Authenticity risk indicator flagged');
    onProgress?.({
      stepIndex: 5,
      subStepText: 'Authenticity risk indicator flagged for Scrutiny Officer review.',
      extractedFieldsCount: totalFields,
      ragPhase: 'idle',
      partialRun: structuredClone(draftRun),
    });
    return draftRun;
  }

  draftRun.stages.authenticity.state = 'passed';
  draftRun.stages.authenticity.decisionPassed = true;

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'authenticityTool',
    stage: 'authenticity',
    action: 'Authenticity Gate Decision: YES (Continue)',
    detail: `Forensic screening passed (${authRes.result.riskScoreNormalized}). Proceeding to RAG Regulatory Compliance.`,
    durationMs: authRes.latencyMs,
    status: 'success',
  });

  draftRun.auditTimeline.push({
    id: `aud-${Date.now()}-auth-ok`,
    timestamp: nowTimeStr(),
    actor: 'authenticityTool (Simulated)',
    action: 'Authenticity Analysis: PASSED',
    detail: `Risk level: ${authRes.result.riskScoreNormalized}.`,
    status: 'success',
  });

  // STAGE 4: RAG REGULATORY COMPLIANCE
  draftRun.stages.compliance.state = 'running';

  // Animate sub-steps: 1. build query -> 2. embed -> 3. search vector DB -> 4. LLM evaluate
  onProgress?.({
    stepIndex: 4,
    subStepText: 'Step 4.1: Constructing APH 2024-27 semantic compliance query from dossier fields...',
    extractedFieldsCount: totalFields,
    ragPhase: 'query',
    partialRun: structuredClone(draftRun),
  });
  await delay(280);

  onProgress?.({
    stepIndex: 4,
    subStepText: 'Step 4.2: Generating 1536-d query embedding vector...',
    extractedFieldsCount: totalFields,
    ragPhase: 'embed',
    partialRun: structuredClone(draftRun),
  });
  await delay(280);

  onProgress?.({
    stepIndex: 4,
    subStepText: `Step 4.3: Querying ${VECTOR_DB_LABEL} for top-3 APH 2024-27 clauses...`,
    extractedFieldsCount: totalFields,
    ragPhase: 'search',
    partialRun: structuredClone(draftRun),
  });

  const vectorRes = await ragRetrieveTool(scenarioId);

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'ragRetrieveTool',
    stage: 'compliance',
    action: `Retrieved Top-3 Passages from ${VECTOR_DB_LABEL}`,
    detail: `Matched rules ${vectorRes.topK
      .map((p) => `${p.ruleId} (${p.similarityScore.toFixed(2)})`)
      .join(', ')}.`,
    durationMs: vectorRes.latencyMs,
    status: 'info',
  });

  onProgress?.({
    stepIndex: 4,
    subStepText:
      'Step 4.4: Running deterministic APH norm checks (FSR, Built-Up Area, Fire NOC, Lease) & LLM evaluation...',
    extractedFieldsCount: totalFields,
    ragPhase: 'evaluate',
    partialRun: structuredClone(draftRun),
  });

  const compRes = await complianceTool(scenarioId, draftRun.fields, vectorRes);
  draftRun.stages.compliance.result = compRes.complianceResult;
  draftRun.stages.compliance.decisionState = compRes.decisionState;

  if (compRes.decisionState === 'NO') {
    draftRun.stages.compliance.state = 'failed';
    draftRun.overallStatus = 'FAILED';
    draftRun.statusBannerText =
      'NON-COMPLIANT / REQUIRES CORRECTION — AICTE APH 2024-27 compliance deficiencies identified with cited handbook rules.';

    emitAgentActivity({
      agent: 'OrchestratorAgent',
      tool: 'complianceTool',
      stage: 'compliance',
      action: 'Compliance Gate Decision: NO (NON-COMPLIANT)',
      detail: compRes.complianceResult.llmEvaluationSummary,
      durationMs: compRes.latencyMs,
      status: 'error',
    });

    draftRun.auditTimeline.push({
      id: `aud-${Date.now()}-comp-no`,
      timestamp: nowTimeStr(),
      actor: 'complianceTool + llmExplainTool (Simulated)',
      action: 'Regulatory Compliance: NON-COMPLIANT / REQUIRES CORRECTION',
      detail: compRes.complianceResult.llmEvaluationSummary,
      status: 'error',
    });
  } else if (compRes.decisionState === 'INSUFFICIENT_EVIDENCE') {
    draftRun.stages.compliance.state = 'needs_review';
    draftRun.overallStatus = 'REQUIRES HUMAN REVIEW';
    draftRun.statusBannerText =
      'REQUIRES HUMAN REVIEW — No matching deterministic rule in APH 2024-27 for Autonomous Hill Council land grant and conditional Syndicate intake.';

    emitAgentActivity({
      agent: 'OrchestratorAgent',
      tool: 'complianceTool',
      stage: 'compliance',
      action: 'Compliance Gate Decision: INSUFFICIENT EVIDENCE (HUMAN REVIEW)',
      detail: compRes.complianceResult.llmEvaluationSummary,
      durationMs: compRes.latencyMs,
      status: 'warning',
    });

    draftRun.auditTimeline.push({
      id: `aud-${Date.now()}-comp-rev`,
      timestamp: nowTimeStr(),
      actor: 'complianceTool (Simulated)',
      action: 'Regulatory Compliance: REQUIRES HUMAN REVIEW',
      detail:
        'No matching rule found in the reference documents. Escalated to AICTE Scrutiny / Standing Hearing Committee Officer.',
      status: 'warning',
    });
  } else {
    draftRun.stages.compliance.state = 'passed';
    draftRun.overallStatus = 'PASSED';
    draftRun.statusBannerText =
      'PASSED — Institution dossier verified within the scope of checks performed.';

    emitAgentActivity({
      agent: 'OrchestratorAgent',
      tool: 'complianceTool',
      stage: 'compliance',
      action: 'Compliance Gate Decision: YES (PASSED)',
      detail: 'All dossier fields comply with cited APH 2024-27 rules; verified within the scope of checks performed.',
      durationMs: compRes.latencyMs,
      status: 'success',
    });

    draftRun.auditTimeline.push({
      id: `aud-${Date.now()}-comp-yes`,
      timestamp: nowTimeStr(),
      actor: 'complianceTool (Simulated)',
      action: 'Regulatory Compliance: PASSED',
      detail: 'Verified within the scope of checks performed.',
      status: 'success',
    });
  }

  // Persist to Fake PostgreSQL
  await dbTool('insert', draftRun, 'Initial scrutiny pipeline execution completed');

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'dbTool',
    stage: 'db',
    action: 'Persisted Verification Run to PostgreSQL (Simulated)',
    detail: `Inserted records into applications, verification_results, and audit_log for ${draftRun.applicationId}.`,
    durationMs: 620,
    status: 'info',
  });

  onProgress?.({
    stepIndex: 5,
    subStepText: 'Verification pipeline completed.',
    extractedFieldsCount: totalFields,
    ragPhase: 'done',
    partialRun: structuredClone(draftRun),
  });

  return draftRun;
}

/**
 * Re-verifies a single edited field or full set of fields inline.
 * Updates field status (e.g. red -> green), recalculates stage & overall status,
 * and logs to Agent Activity + Fake PostgreSQL.
 */
export async function reverifyEditedFields(
  currentRun: VerificationRun,
  updatedValues: Partial<Record<FieldKey, string>>
): Promise<VerificationRun> {
  await delay(750);

  const updatedFields: FieldValidationDetail[] = currentRun.fields.map((field) => {
    if (updatedValues[field.key] !== undefined) {
      const nextVal = updatedValues[field.key]!;
      const reEvaluated = evaluateSingleField(field.key, nextVal);
      return {
        ...reEvaluated,
        wasEditedAndVerified:
          reEvaluated.status === 'correct' &&
          (field.status === 'wrong' || field.wasEditedAndVerified),
      };
    }
    return field;
  });

  const nextRun: VerificationRun = structuredClone(currentRun);
  nextRun.fields = updatedFields;
  nextRun.updatedAt = new Date().toISOString();

  const failedTemplateFields: FieldKey[] = [];
  for (const f of updatedFields) {
    if (
      (f.key === 'permanentInstituteId' ||
        f.key === 'applicationId' ||
        f.key === 'applicationType') &&
      f.status === 'wrong'
    ) {
      failedTemplateFields.push(f.key);
    }
    if (
      f.key === 'fireNocValidUntil' &&
      !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(f.extractedValue.trim())
    ) {
      failedTemplateFields.push(f.key);
    }
  }

  if (failedTemplateFields.length > 0) {
    nextRun.stages.template.state = 'failed';
    nextRun.stages.template.decisionPassed = false;
    nextRun.stages.template.failedFields = failedTemplateFields;
    nextRun.stages.template.summary =
      'TEMPLATE VALIDATION FAILED: Mandatory portal ID or date syntax fields still require correction.';
    nextRun.overallStatus = 'FAILED';
    nextRun.statusBannerText =
      'TEMPLATE VALIDATION FAILED — Mandatory dossier template fields still require correction.';
  } else {
    nextRun.stages.template.state = 'passed';
    nextRun.stages.template.decisionPassed = true;
    nextRun.stages.template.failedFields = [];
    nextRun.stages.template.summary =
      'All 9 mandatory AICTE Scrutiny Dossier annexures, portal IDs (1-NNNNNNN), and DD/MM/YYYY date formats verified.';

    if (nextRun.stages.authenticity.state === 'skipped') {
      const authRes = await authenticityTool('A');
      nextRun.stages.authenticity.state = 'passed';
      nextRun.stages.authenticity.decisionPassed = true;
      nextRun.stages.authenticity.result = authRes.result;
    }

    if (nextRun.stages.authenticity.state === 'flagged') {
      nextRun.overallStatus = 'FLAGGED';
      nextRun.statusBannerText =
        'FLAGGED / REQUIRES REVIEW — Visual risk indicator remains active on Fire NOC date/stamp region and lab photo hash.';
    } else {
      const hasWrong = updatedFields.some((f) => f.status === 'wrong');
      const hasNeedsReview = updatedFields.some(
        (f) => f.status === 'needs_review' || f.status === 'warning'
      );

      if (!nextRun.stages.compliance.result) {
        const vectorRes = await ragRetrieveTool(nextRun.scenarioId);
        const compRes = await complianceTool('A', updatedFields, vectorRes);
        nextRun.stages.compliance.result = compRes.complianceResult;
      } else {
        nextRun.stages.compliance.result.deterministicChecks = updatedFields.map(
          (f) => ({
            id: `det-${f.key}`,
            fieldLabel: f.label,
            checkDescription: 'Deterministic APH 2024-27 syntax & norm boundary check',
            passed: f.status === 'correct',
            detail: f.inlineCaption,
          })
        );
      }

      if (!hasWrong && !hasNeedsReview) {
        nextRun.stages.compliance.state = 'passed';
        nextRun.stages.compliance.decisionState = 'YES';
        if (nextRun.stages.compliance.result) {
          nextRun.stages.compliance.result.status = 'PASSED';
          nextRun.stages.compliance.result.llmEvaluationSummary = `All ${updatedFields.length} extracted dossier fields satisfy deterministic APH 2024-27 checks and align with the top-3 retrieved regulatory clauses (APH-6.1, APH-5.1, APH-3.1). Dossier is verified within the scope of checks performed.`;
        }
        nextRun.overallStatus = 'PASSED';
        nextRun.statusBannerText =
          'PASSED — All corrected dossier fields re-verified. Verified within the scope of checks performed.';
      } else if (hasNeedsReview && !hasWrong) {
        nextRun.stages.compliance.state = 'needs_review';
        nextRun.stages.compliance.decisionState = 'INSUFFICIENT_EVIDENCE';
        if (nextRun.stages.compliance.result) {
          nextRun.stages.compliance.result.status = 'REQUIRES HUMAN REVIEW';
        }
        nextRun.overallStatus = 'REQUIRES HUMAN REVIEW';
        nextRun.statusBannerText =
          'REQUIRES HUMAN REVIEW — Special category land/university endorsement requires Scrutiny / SHC Officer sign-off.';
      } else {
        nextRun.stages.compliance.state = 'failed';
        nextRun.stages.compliance.decisionState = 'NO';
        if (nextRun.stages.compliance.result) {
          nextRun.stages.compliance.result.status =
            'NON-COMPLIANT / REQUIRES CORRECTION';
        }
        nextRun.overallStatus = 'FAILED';
        nextRun.statusBannerText =
          'NON-COMPLIANT / REQUIRES CORRECTION — One or more dossier parameters still violate APH 2024-27 norms.';
      }
    }
  }

  const changedFieldLabels = Object.keys(updatedValues).join(', ');

  emitAgentActivity({
    agent: 'OrchestratorAgent',
    tool: 'complianceTool',
    stage: 'compliance',
    action: `Re-verified Edited Dossier Field(s): ${changedFieldLabels}`,
    detail: `Updated status: ${nextRun.overallStatus}. ${nextRun.statusBannerText}`,
    durationMs: 750,
    status: nextRun.overallStatus === 'PASSED' ? 'success' : 'info',
  });

  nextRun.auditTimeline.unshift({
    id: `aud-${Date.now()}-reverify`,
    timestamp: nowTimeStr(),
    actor: 'AICTE Scrutiny Officer + complianceTool',
    action: `Inline Edit & Re-Verification (${changedFieldLabels})`,
    detail: `Re-ran deterministic APH 2024-27 norm validation. Overall status is now ${nextRun.overallStatus}.`,
    status: nextRun.overallStatus === 'PASSED' ? 'success' : 'info',
  });

  await dbTool('update', nextRun, `Re-verified dossier fields: ${changedFieldLabels}`);
  return nextRun;
}

/**
 * Synchronously builds the 5 pre-populated seed runs (D first as main demo, then A, B, C, E)
 * so the app starts with rich AICTE data in History and Review Dashboard immediately.
 */
export function buildSeedVerificationRuns(): VerificationRun[] {
  const scenarios: ScenarioId[] = ['D', 'A', 'B', 'C', 'E'];

  return scenarios.map((scId, idx) => {
    const meta = SCENARIO_META[scId];
    const fields = buildInitialScenarioFields(scId);
    const createdDate = new Date(Date.now() - idx * 3600_000 * 4).toISOString();

    let overallStatus: OverallStatus = 'PASSED';
    let statusBannerText =
      'PASSED — Institution dossier verified within the scope of checks performed.';

    const stages: PipelineStagesSummary = {
      ocr: {
        state: 'passed',
        fieldsExtractedCount: fields.length,
        summary: `Extracted ${fields.length} structured fields across Annexures 1–9 from "${meta.defaultFileName}".`,
      },
      template: {
        state: 'passed',
        decisionPassed: true,
        summary:
          'All 9 mandatory AICTE Scrutiny Dossier annexures, portal IDs (1-NNNNNNN), and DD/MM/YYYY date formats verified.',
        failedFields: [],
      },
      authenticity: {
        state: 'passed',
        decisionPassed: true,
        result: {
          passed: true,
          status: 'PASSED',
          riskLevel: 'Low Risk Indicator',
          riskScoreNormalized: '0.12 (Low Risk Indicator)',
          llmExplanation:
            'Simulated GAN/ELA visual screening found uniform substrate compression across all statutory certificates (Fire NOC, Building Occupancy Certificate, Lease Deed) and unique perceptual hashes across all geotagged laboratory photos in Annexure-8. Note: Visual screening is a risk indicator, not proof of forgery, and is separate from issuer portal verification.',
          indicators: [
            {
              id: 'ind-1',
              label: 'Fire NOC & Seal Substrate Continuity (Annexure-4)',
              finding:
                'Uniform compression noise and continuous glyph luminance across date and official stamp regions.',
              severity: 'low',
            },
            {
              id: 'ind-2',
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
      },
      compliance: {
        state: 'passed',
        decisionState: 'YES',
        result: {
          status: 'PASSED',
          queryBuilt:
            'AICTE APH 2024-27 faculty_student_ratio 1:20 norm AND fire_noc_valid_until active check AND built_up_area_sqm requirement',
          embeddingVectorPreview:
            '[-0.0241, 0.0819, -0.0412, 0.1104, 0.0093, ... 1536 dims]',
          retrievedPassages: [
            {
              docName: 'AICTE Approval Process Handbook 2024-27',
              fileName: 'AICTE_APH_2024_27.pdf',
              page: 119,
              section: 'Annexure-5, Clause 6.2',
              sectionTitle: 'Mandatory Faculty-Student Ratio (FSR 1:20 Ceiling)',
              ruleId: 'APH-6.1',
              unverified: true,
              text: 'Rule APH-6.1 (Annexure-5, Clause 6.2, Faculty-Student Ratio Norms) [UNVERIFIED - confirm against APH 2024-27 text]: Technical institutions offering Undergraduate Engineering & Technology programmes must maintain a minimum regular Faculty-Student Ratio (FSR) no worse than 1:20 (with 1:15 desirable) across approved student intake.',
              similarityScore: 0.91,
            },
            {
              docName: 'AICTE Approval Process Handbook 2024-27',
              fileName: 'AICTE_APH_2024_27.pdf',
              page: 102,
              section: 'Chapter V, Clause 5.3',
              sectionTitle: 'Mandatory Active Fire & Life Safety NOC Validity Window',
              ruleId: 'APH-5.1',
              unverified: true,
              text: 'Rule APH-5.1 (Chapter V, Clause 5.3, Fire Safety NOC Validity) [UNVERIFIED - confirm against APH 2024-27 text]: Every technical institution must hold a valid Fire and Life Safety No Objection Certificate (Fire NOC) issued by the competent State/Municipal Fire Authority. An expired Fire Safety NOC renders the dossier non-compliant.',
              similarityScore: 0.84,
            },
            {
              docName: 'AICTE Approval Process Handbook 2024-27',
              fileName: 'AICTE_APH_2024_27.pdf',
              page: 49,
              section: 'Chapter II, Clause 2.11',
              sectionTitle:
                'Cross-Document Intake Consistency (Portal vs. Affiliating University NOC)',
              ruleId: 'APH-2.4',
              unverified: true,
              text: 'Rule APH-2.4 (Chapter II, Clause 2.11, Affiliating University Intake Alignment) [UNVERIFIED - confirm against APH 2024-27 text]: The Approved/Proposed Intake declared in the AICTE portal dossier must be consistent with the seat intake endorsed in the Affiliating University NOC (Format-2).',
              similarityScore: 0.79,
            },
          ],
          deterministicChecks: fields.map((f) => ({
            id: `det-seed-${f.key}`,
            fieldLabel: f.label,
            checkDescription: 'Deterministic APH 2024-27 norm & boundary check',
            passed: f.status === 'correct',
            detail: f.inlineCaption,
          })),
          llmEvaluationSummary:
            'Evaluated extracted institutional dossier parameters against retrieved AICTE APH 2024-27 clauses and deterministic checks.',
        },
      },
    };

    if (scId === 'B') {
      overallStatus = 'FAILED';
      statusBannerText =
        'TEMPLATE VALIDATION FAILED — Dossier halted at Stage 2 Gate due to missing Permanent Institute ID (APH-1.1) and invalid Fire NOC date format (APH-1.5).';
      stages.template.state = 'failed';
      stages.template.decisionPassed = false;
      stages.template.failedFields = ['permanentInstituteId', 'fireNocValidUntil'];
      stages.template.summary =
        'TEMPLATE VALIDATION FAILED: Missing mandatory Permanent Institute ID (PID) and non-DD/MM/YYYY Fire NOC expiry date.';
      stages.authenticity.state = 'skipped';
      stages.authenticity.decisionPassed = null;
      stages.authenticity.result = undefined;
      stages.compliance.state = 'skipped';
      stages.compliance.decisionState = null;
      stages.compliance.result = undefined;
    } else if (scId === 'C') {
      overallStatus = 'FLAGGED';
      statusBannerText =
        'FLAGGED / REQUIRES REVIEW — Elevated risk indicator on Fire NOC date/stamp region and duplicate lab photo hash (forensic screening is a risk indicator, not proof of forgery).';
      stages.authenticity.state = 'flagged';
      stages.authenticity.decisionPassed = false;
      stages.authenticity.result = {
        passed: false,
        status: 'FLAGGED / REQUIRES REVIEW',
        riskLevel: 'Elevated Risk Indicator',
        riskScoreNormalized: '0.78 (Elevated Risk Indicator)',
        llmExplanation:
          'Simulated GAN/ELA document screening identified localized high-frequency compression residuals around the "Valid Until" date box and issuing seal on Annexure-4 (Fire Safety NOC), alongside a perceptual hash collision (pHash Δ=2) indicating a reused Computer Lab photograph in Annexure-8. Note: Visual and photo-hash screening is a risk indicator, not proof of forgery, and does not replace cryptographic or issuing-authority verification.',
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
      };
      stages.compliance.state = 'skipped';
      stages.compliance.decisionState = null;
      stages.compliance.result = undefined;
    } else if (scId === 'D') {
      overallStatus = 'FAILED';
      statusBannerText =
        'NON-COMPLIANT / REQUIRES CORRECTION — Faculty Count & FSR ("18 Faculty (FSR 1:25)", Rule APH-6.1) and Fire & Life Safety NOC Valid Until ("15/03/2024", Rule APH-5.1) violate AICTE APH 2024-27 norms.';
      stages.compliance.state = 'failed';
      stages.compliance.decisionState = 'NO';
      if (stages.compliance.result) {
        stages.compliance.result.status = 'NON-COMPLIANT / REQUIRES CORRECTION';
        stages.compliance.result.llmEvaluationSummary =
          'Combined deterministic validation and retrieved AICTE APH 2024-27 text indicate non-compliance on 2 dossier parameters: Faculty Count & FSR (18 Faculty (FSR 1:25)) violates Annexure-5, Clause 6.2 (Rule APH-6.1) and Fire & Life Safety NOC Valid Until (15/03/2024) violates Chapter V, Clause 5.3 (Rule APH-5.1).';
      }
    } else if (scId === 'E') {
      overallStatus = 'REQUIRES HUMAN REVIEW';
      statusBannerText =
        'REQUIRES HUMAN REVIEW — No matching deterministic rule in APH 2024-27 for Autonomous Hill Council customary land grant and conditional Syndicate intake endorsement.';
      stages.compliance.state = 'needs_review';
      stages.compliance.decisionState = 'INSUFFICIENT_EVIDENCE';
      if (stages.compliance.result) {
        stages.compliance.result.status = 'REQUIRES HUMAN REVIEW';
        stages.compliance.result.llmEvaluationSummary =
          'No matching deterministic rule found in the reference corpus covering Autonomous Hill Council customary land grants or conditional University Syndicate intake ratifications (Rules APH-7.2, AUD-2.5). Escalated for Scrutiny / Standing Hearing Committee (SHC) review.';
      }
    }

    return {
      id: `VER-2026-9010${idx + 1}`,
      applicationId:
        fields.find((f) => f.key === 'applicationId')?.extractedValue ||
        `1-4464298310${idx}`,
      scenarioId: scId,
      scenarioTitle: meta.title,
      fileName: meta.defaultFileName,
      fileType: 'application/pdf',
      fileSize: '2.84 MB',
      createdAt: createdDate,
      updatedAt: createdDate,
      overallStatus,
      statusBannerText,
      fields,
      stages,
      reviewerNotes:
        scId === 'D'
          ? 'Main Demo Scenario (AICTE Scrutiny): Hover or click the red (i) icons on Faculty Count & FSR ("18 Faculty (FSR 1:25)") or Fire & Life Safety NOC Valid Until ("15/03/2024") to inspect APH 2024-27 citations, or edit inline and click Re-verify.'
          : '',
      auditTimeline: [
        {
          id: `seed-aud-1-${scId}`,
          timestamp: '19:15:04',
          actor: 'Orchestration Agent (Simulated)',
          action: `Executed AICTE Scrutiny Pipeline (${meta.shortLabel})`,
          detail: statusBannerText,
          status:
            overallStatus === 'PASSED'
              ? 'success'
              : overallStatus === 'FAILED'
              ? 'error'
              : 'warning',
        },
      ],
    };
  });
}
