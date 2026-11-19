import React, { useState } from 'react';
import { X, Copy, Check, Flame, Share2 } from 'lucide-react';
import { RoastResult } from '../types/roaster';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RoastResult;
  targetRole?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  result,
  targetRole,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🔥 My resume just got ROASTED by AI!
Overall Score: ${result.overallScore}/100
ATS Score: ${result.atsScore.score}/100
Verdict: ${result.finalVerdict.badge}

"${result.roastOfTheDay}"

Get your resume roasted and discover your ATS flaws at Resume Roaster 🔥`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Share Your Roast Badge</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shareable Card Preview */}
        <div className="my-6 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950/40 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-white">
                RESUME ROASTER 🔥
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400">
              {result.overallScore}/100
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {targetRole ? `Candidate for ${targetRole}` : 'Candidate Diagnostic'}
            </div>
            <div className="text-lg font-black text-white">
              {result.finalVerdict.badge}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-neutral-950/80 p-3 border border-neutral-800 text-xs italic text-neutral-200">
            "{result.roastOfTheDay}"
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/80">
            <span>ATS Score: {result.atsScore.score}%</span>
            <span>Content Quality: {result.contentQualityScore.score}%</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-400">
            Shareable text snippet:
          </label>
          <div className="rounded-xl bg-neutral-950 p-3 text-xs text-neutral-300 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto border border-neutral-800">
            {shareText}
          </div>

          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl fire-gradient px-4 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Shareable Snippet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
