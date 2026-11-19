import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, Trash2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Privacy & Data Confidentiality</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
            <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">In-Memory Processing Only</span>
              Uploaded documents (PDFs, DOCX files) and pasted text are parsed transiently in server memory solely to generate your roast and ATS analysis.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
            <EyeOff className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">No Training on Your Personal Data</span>
              Your personal information, career details, contact numbers, and emails are never used to train public AI foundation models.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
            <Server className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Local History Control</span>
              Past roasts displayed in the History drawer are stored locally in your browser's private <code className="font-mono text-neutral-400">localStorage</code>. You can purge them at any time with one click.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-3 text-xs font-semibold text-white transition-colors"
        >
          Got It, Thanks
        </button>
      </div>
    </div>
  );
};
