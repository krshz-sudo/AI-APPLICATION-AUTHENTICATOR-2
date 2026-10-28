import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Play,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCheck,
  File,
} from 'lucide-react';
import { FieldValidationDetail } from '../types';
import { buildInitialScenarioFields } from '../mock/tools';
import { DocumentSpecimen } from './DocumentSpecimen';

interface UploadScreenProps {
  onStartVerification: (customFile?: {
    name: string;
    type: string;
    size: string;
  }) => void;
  onGoToReviewDirectly: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  onStartVerification,
  onGoToReviewDirectly,
}) => {
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    size: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpecimenOpen, setIsSpecimenOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultFileName =
    'Dossier_EoA_Nalanda_Vishwa_Academy_Submission_SYNTHETIC.pdf';
  const defaultFields: FieldValidationDetail[] = buildInitialScenarioFields('D');

  const handleFileChange = (file?: File) => {
    if (!file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFile({
      name: file.name,
      type: file.type || 'application/pdf',
      size: `${sizeMB === '0.00' ? '0.45' : sizeMB} MB`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Short one-line summary */}
      <div className="text-slate-600 text-sm">
        Upload an AICTE institution approval dossier (EoA / New Course / Increase in Intake) to run OCR extraction, document &amp; photo authenticity screening, and APH 2024–27 regulatory compliance verification.
      </div>

      {/* Main Single Column Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors duration-150 ${
            isDragging
              ? 'border-teal bg-teal-50/50'
              : 'border-slate-300 hover:border-teal bg-slate-50/60 hover:bg-slate-50'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload document dropzone"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6 text-teal" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {uploadedFile
              ? `Attached: ${uploadedFile.name} (${uploadedFile.size})`
              : 'Drag & drop an application file (PDF, JPG, PNG), or browse'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {uploadedFile
              ? 'Ready for AICTE Scrutiny processing'
              : `Default specimen: ${defaultFileName} (2.84 MB • SYNTHETIC)`}
          </p>
          {uploadedFile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedFile(null);
              }}
              className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium underline"
            >
              Remove file &amp; reset to default
            </button>
          )}
        </div>

        {/* Action Button Row: full width on mobile, right-aligned on desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onGoToReviewDirectly}
            className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors duration-150 order-2 sm:order-1"
          >
            <span>Review Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
          <button
            type="button"
            onClick={() => onStartVerification(uploadedFile || undefined)}
            className="px-6 py-2.5 rounded-lg bg-teal text-navy-900 hover:bg-teal-600 font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors duration-150 order-1 sm:order-2"
          >
            <Play className="w-4 h-4 fill-navy-900" />
            <span>Run Verification</span>
          </button>
        </div>
      </div>

      {/* Collapsible Specimen Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsSpecimenOpen((prev) => !prev)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors duration-150"
          aria-expanded={isSpecimenOpen}
        >
          <div className="flex items-center gap-2.5">
            <File className="w-4 h-4 text-teal" />
            <span className="font-semibold text-sm text-slate-900">
              Document Specimen Preview
            </span>
            <span className="text-xs text-slate-500">
              ({uploadedFile?.name || defaultFileName})
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>{isSpecimenOpen ? 'Hide' : 'Show preview'}</span>
            {isSpecimenOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {isSpecimenOpen && (
          <div className="p-5 border-t border-slate-200 bg-slate-50/50">
            <DocumentSpecimen
              fileName={uploadedFile?.name || defaultFileName}
              scenarioId="D"
              fields={defaultFields}
              highlightedField={null}
              showBoundingBoxes={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
