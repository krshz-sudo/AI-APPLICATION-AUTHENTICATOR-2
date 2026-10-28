import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Scan,
  Stamp,
  Camera,
} from 'lucide-react';
import {
  AuthenticityResult,
  FieldKey,
  FieldValidationDetail,
  ScenarioId,
} from '../types';
import { DOSSIER_DOCUMENT_TYPES } from '../mock/tools';

interface DocumentSpecimenProps {
  fileName: string;
  scenarioId: ScenarioId;
  fields: FieldValidationDetail[];
  highlightedField: FieldKey | null;
  onSelectField?: (key: FieldKey | null) => void;
  isScanning?: boolean;
  authenticityResult?: AuthenticityResult;
  showBoundingBoxes?: boolean;
}

export const DocumentSpecimen: React.FC<DocumentSpecimenProps> = ({
  fileName,
  scenarioId,
  fields,
  highlightedField,
  onSelectField,
  isScanning = false,
  authenticityResult,
  showBoundingBoxes = true,
}) => {
  const renderFieldBox = (f: FieldValidationDetail, idx: number) => {
    const status = f.status || 'correct';
    const isActive = highlightedField === f.key;

    const boxColor = !showBoundingBoxes
      ? 'border-slate-300 bg-slate-50/70'
      : status === 'correct'
      ? 'border-[#16A34A] bg-[#16A34A]/10'
      : status === 'wrong'
      ? 'border-[#DC2626] bg-[#DC2626]/15'
      : status === 'warning'
      ? 'border-[#F59E0B] bg-[#F59E0B]/15'
      : 'border-[#6366F1] bg-[#6366F1]/15';

    return (
      <div
        key={f.key}
        onMouseEnter={() => onSelectField?.(f.key)}
        onMouseLeave={() => onSelectField?.(null)}
        onClick={() => onSelectField?.(f.key)}
        className={`relative rounded-lg border-2 p-2.5 transition-all cursor-pointer ${boxColor} ${
          isActive ? 'ring-2 ring-[#0B1F3A] scale-[1.01] shadow-md z-10' : ''
        } ${idx === 0 || idx === 7 ? 'sm:col-span-2' : ''}`}
      >
        <div className="flex items-center justify-between gap-1 mb-0.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {idx + 1}. {f.label}
          </span>
          <div className="flex items-center gap-1">
            {f.page && (
              <span className="text-[9px] font-mono text-slate-500 bg-white/80 px-1 rounded border border-slate-200">
                p.{f.page} • {f.confidence || '98%'}
              </span>
            )}
            {showBoundingBoxes && (
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  status === 'correct'
                    ? 'bg-[#16A34A] text-white'
                    : status === 'wrong'
                    ? 'bg-[#DC2626] text-white'
                    : status === 'warning'
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-[#6366F1] text-white'
                }`}
              >
                {status === 'correct'
                  ? 'OK'
                  : status === 'wrong'
                  ? 'DEFICIENCY'
                  : 'REVIEW'}
              </span>
            )}
          </div>
        </div>
        <div
          className={`font-mono text-xs font-bold break-words ${
            status === 'wrong' && showBoundingBoxes
              ? 'text-red-900'
              : 'text-slate-900'
          }`}
        >
          {f.extractedValue}
        </div>
        {f.sourceDoc && (
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            Source: {f.sourceDoc}
          </div>
        )}
      </div>
    );
  };

  const forensicFlagged =
    scenarioId === 'C' || (authenticityResult && !authenticityResult.passed);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl">
      {/* Document Toolbar */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-[#14B8A6] shrink-0" />
          <span className="font-mono font-medium truncate text-white">
            {fileName}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            SYNTHETIC DEMO DATA
          </span>
          {isScanning && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14B8A6] animate-pulse">
              <Scan className="w-3.5 h-3.5" />
              OCR Scanning...
            </span>
          )}
        </div>
      </div>

      {/* Simulated AICTE Consolidated Scrutiny Dossier Sheet */}
      <div className="relative bg-white rounded-xl border-2 border-slate-300 shadow-inner p-4 sm:p-5 text-slate-900 overflow-hidden">
        {/* Animated OCR Laser Scan Line */}
        {isScanning && (
          <motion.div
            initial={{ top: '2%' }}
            animate={{ top: ['4%', '94%', '4%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#14B8A6] to-transparent shadow-[0_0_16px_4px_rgba(20,184,166,0.65)] z-30 pointer-events-none"
          />
        )}

        {/* Dossier Header */}
        <div className="border-b-2 border-[#0B1F3A] pb-3 mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-[#0B1F3A] text-white">
                AICTE SCRUTINY / EVC DOSSIER • APH 2024–27
              </span>
              <span className="text-[10px] font-mono font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                SYNTHETIC SPECIMEN
              </span>
            </div>
            <h4 className="font-bold text-sm sm:text-base text-[#0B1F3A] mt-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span>INSTITUTION APPROVAL &amp; ANNEXURE COMPLIANCE SUMMARY</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Consolidated Part-I / Part-II Dossier &amp; Annexures 1–9 — Subject to
              Template, Forensic &amp; APH 2024-27 Verification
            </p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-500 shrink-0">
            <div>ANNEXURES: 1–9</div>
            <div>CORPUS: APH 24-27</div>
          </div>
        </div>

        {/* Attached Dossier Document Types Strip */}
        <div className="mb-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Bundled Dossier Document Types (9 Annexures Indexed):
          </div>
          <div className="flex flex-wrap gap-1">
            {DOSSIER_DOCUMENT_TYPES.map((doc) => (
              <span
                key={doc}
                className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700"
              >
                {doc.split(':')[0]}: {doc.split(':')[1]?.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Data-Driven Field Boxes (renders all fields dynamically from run.fields) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          {fields.map((f, idx) => renderFieldBox(f, idx))}
        </div>

        {/* Forensic Inspection Regions: Left = Fire NOC Stamp/Date Region | Right = Geotagged Lab Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-dashed border-slate-300">
          <div
            className={`rounded-xl border-2 p-2.5 flex items-center justify-between gap-2 ${
              forensicFlagged
                ? 'border-[#F59E0B] bg-amber-50/90 ring-2 ring-amber-400/30'
                : 'border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Stamp
                className={`w-5 h-5 shrink-0 ${
                  forensicFlagged ? 'text-amber-700' : 'text-slate-600'
                }`}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-700 truncate">
                  Annexure-4 Stamp &amp; Date Region
                </div>
                <div className="text-[10px] text-slate-500">
                  {forensicFlagged
                    ? 'ELA date-box splice residual flagged'
                    : 'Substrate & seal compression uniform'}
                </div>
              </div>
            </div>
            {forensicFlagged ? (
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[9px] font-mono font-bold shrink-0 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                RISK 0.78
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-700 font-semibold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                0.12 OK
              </span>
            )}
          </div>

          <div
            className={`rounded-xl border-2 p-2.5 flex items-center justify-between gap-2 ${
              forensicFlagged
                ? 'border-[#F59E0B] bg-amber-50/90 ring-2 ring-amber-400/30'
                : 'border-slate-300 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Camera
                className={`w-5 h-5 shrink-0 ${
                  forensicFlagged ? 'text-amber-700' : 'text-slate-600'
                }`}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-700 truncate">
                  Annexure-8 Geotagged Lab Photos
                </div>
                <div className="text-[10px] text-slate-500">
                  {forensicFlagged
                    ? 'Duplicate lab photo pHash collision'
                    : 'Unique perceptual hashes verified'}
                </div>
              </div>
            </div>
            {forensicFlagged ? (
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[9px] font-mono font-bold shrink-0 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                DUPLICATE
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-700 font-semibold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                UNIQUE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Legend under Document Preview */}
      <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            APH Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
            APH Deficiency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            Risk Indicator / Warning
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
            Scrutiny / SHC Review
          </span>
        </div>
        <span className="text-slate-400 font-mono">
          Hover or click any box ({fields.length} extracted fields)
        </span>
      </div>
    </div>
  );
};
