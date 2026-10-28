import React, { useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { MOCK_CORPUS } from '../mock/corpus';

interface ArchitectureScreenProps {
  onOpenPdfSnippet: (ruleId: string) => void;
}

export const ArchitectureScreen: React.FC<ArchitectureScreenProps> = ({
  onOpenPdfSnippet,
}) => {
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('ALL');

  const docNames = Array.from(new Set(MOCK_CORPUS.map((c) => c.docName)));
  const filteredCorpus =
    selectedDocFilter === 'ALL'
      ? MOCK_CORPUS
      : MOCK_CORPUS.filter((c) => c.docName === selectedDocFilter);

  return (
    <div className="space-y-6">
      {/* Reference Corpus Browser (All 20 AICTE APH 2024-27 DEMO DATA Entries) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <BookOpen className="w-5 h-5 text-[#14B8A6]" />
              <h2 className="font-bold text-base text-slate-900">
                AICTE APH 2024–27 Regulatory Reference Corpus (20 Rules)
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FF9933]/20 text-[#9A3412] border border-[#FF9933]/40">
                DEMO DATA • SYNTHETIC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Every compliance deficiency flagged during scrutiny cites one of these 20
              rules. Click any entry to preview its simulated PDF clause.
            </p>
          </div>

          <select
            aria-label="Filter reference corpus by document"
            value={selectedDocFilter}
            onChange={(e) => setSelectedDocFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50"
          >
            <option value="ALL">All Reference Documents (20 Rules)</option>
            {docNames.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCorpus.map((entry) => (
            <div
              key={entry.ruleId}
              onClick={() => onOpenPdfSnippet(entry.ruleId)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#14B8A6] bg-slate-50/60 hover:bg-white cursor-pointer transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0B1F3A] text-[#14B8A6]">
                    Rule {entry.ruleId}
                  </span>
                  {entry.unverified && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      UNVERIFIED
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#14B8A6]" />
                  {entry.fileName} • p.{entry.page}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                {entry.docName} — {entry.section} ({entry.sectionTitle})
              </div>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {entry.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
