import React from 'react';
import { Flame, History, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  historyCount: number;
  onReset: () => void;
  hasActiveResult: boolean;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  historyCount,
  onReset,
  hasActiveResult,
  onOpenPrivacy,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark with flame */}
        <button
          onClick={onReset}
          className="group flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90 whitespace-nowrap shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl tracking-tight font-extrabold text-white">
            RESUME <span className="fire-text-gradient">ROASTER</span>
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <a
            href="#roaster"
            onClick={(e) => {
              if (hasActiveResult) {
                // Stay on page
              }
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Roaster
          </a>
          <a
            href="#features"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#rubric"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            ATS Breakdown
          </a>
          <button
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Privacy & Security</span>
          </button>
        </nav>

        {/* Zone 3: Primary action + History */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-850 hover:text-white whitespace-nowrap shrink-0"
            title="View previous roasts"
          >
            <History className="h-4 w-4 text-orange-400" />
            <span className="hidden sm:inline">Roast History</span>
            {historyCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>

          {hasActiveResult ? (
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-rose-700 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Roast Another</span>
            </button>
          ) : (
            <a
              href="#roast-form"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-rose-700 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Roast My Resume 🔥</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
