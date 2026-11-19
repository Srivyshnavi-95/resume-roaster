import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onReset: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onReset }) => {
  return (
    <footer className="mt-20 border-t border-neutral-800/80 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                RESUME ROASTER 🔥
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                "Your Resume Has Been Through Enough. Let's Make It Better."
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-400">
            <button
              onClick={onReset}
              className="hover:text-white transition-colors"
            >
              Analyze New Resume
            </button>
            <a
              href="#rubric"
              className="hover:text-white transition-colors"
            >
              ATS Rubric
            </a>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Privacy & Ethics</span>
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
          <p>
            © {new Date().getFullYear()} Resume Roaster. Powered by Google Gemini 4 Flash. Roasting the resume, never the person.
          </p>
          <p className="text-neutral-400">
            Confidential in-memory processing. Resumes are never stored or used to train public models.
          </p>
        </div>
      </div>
    </footer>
  );
};
