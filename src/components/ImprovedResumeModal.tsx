import React, { useState } from 'react';
import { X, Copy, Download, Check, Sparkles, Columns, FileText, ArrowRight } from 'lucide-react';
import { ImprovedResumeData } from '../types/roaster';

interface ImprovedResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImprovedResumeData | null;
  originalText: string;
  targetRole?: string;
  isLoading: boolean;
}

export const ImprovedResumeModal: React.FC<ImprovedResumeModalProps> = ({
  isOpen,
  onClose,
  data,
  originalText,
  targetRole,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<'improved' | 'compare' | 'changes'>('improved');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!data?.improvedMarkdown) return;
    try {
      await navigator.clipboard.writeText(data.improvedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!data?.improvedMarkdown) return;
    const blob = new Blob([data.improvedMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'overhauled_ats_resume.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Overhauled ATS Resume Draft</span>
                {targetRole && (
                  <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-normal">
                    Target: {targetRole}
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Rewritten with action verbs, quantified metric placeholders, and standardized headers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .md</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switch */}
        <div className="flex items-center gap-2 border-b border-neutral-800 px-6 py-2.5 bg-neutral-950/40 text-xs">
          <button
            onClick={() => setViewMode('improved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'improved'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Overhauled Resume</span>
          </button>

          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'compare'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side Comparison</span>
          </button>

          <button
            onClick={() => setViewMode('changes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              viewMode === 'changes'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>Key Strategic Upgrades</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping" />
                <Sparkles className="h-8 w-8 text-orange-400 animate-spin" />
              </div>
              <h4 className="text-lg font-bold text-white">Synthesizing Executive-Grade Resume...</h4>
              <p className="text-xs text-neutral-400 max-w-sm">
                Transforming weak verbs, injecting metric placeholders, and aligning headers to ATS parsing specifications.
              </p>
            </div>
          ) : !data ? (
            <div className="text-center py-20 text-neutral-400">
              No overhaul data available. Click "Generate Overhauled Resume" to create your draft.
            </div>
          ) : (
            <>
              {/* Executive Summary Callout */}
              <div className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-950/20 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
                  Elevator Pitch Hook
                </span>
                <p className="text-xs sm:text-sm text-neutral-200 italic leading-relaxed">
                  "{data.executiveSummaryHighlight}"
                </p>
              </div>

              {/* View 1: Improved Full Resume */}
              {viewMode === 'improved' && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 font-mono text-xs sm:text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed select-text shadow-inner">
                  {data.improvedMarkdown}
                </div>
              )}

              {/* View 2: Side by Side Comparison */}
              {viewMode === 'compare' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                    <div className="border-b border-neutral-800 bg-neutral-900/80 px-4 py-2 text-xs font-bold text-rose-400">
                      Original Submission
                    </div>
                    <div className="p-4 font-mono text-xs text-neutral-400 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[50vh]">
                      {originalText}
                    </div>
                  </div>

                  <div className="flex flex-col rounded-2xl border border-emerald-900/40 bg-neutral-950 overflow-hidden">
                    <div className="border-b border-neutral-800 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-400">
                      Overhauled ATS Draft
                    </div>
                    <div className="p-4 font-mono text-xs text-emerald-100 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[50vh]">
                      {data.improvedMarkdown}
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: Key Changes */}
              {viewMode === 'changes' && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-white">
                    Strategic Improvements Implemented:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.keyChangesMade.map((change, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-300 flex items-start gap-3"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shrink-0">
                          ✓
                        </span>
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
