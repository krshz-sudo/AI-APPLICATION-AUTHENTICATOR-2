import React from 'react';
import { Info } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-400 border-t border-slate-800 mt-auto no-print">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 mb-3 border-b border-slate-800 text-xs">
          <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <Info className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Authenticity Screening:</strong> Visual forensic
              analysis serves as a risk indicator, separate from cryptographic signature validation.
            </p>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <Info className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Regulatory Compliance:</strong> Semantic vector
              retrieval surfaces relevant statutory guidelines, evaluated alongside deterministic business rules.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p className="font-medium text-slate-300">
            AI Document Analyser
          </p>
          <p className="text-slate-500">
            Document Extraction &bull; Forensic Screening &bull; Statutory Verification
          </p>
        </div>
      </div>
    </footer>
  );
};
