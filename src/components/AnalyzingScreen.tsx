import React, { useEffect, useState } from 'react';
import { Flame, Sparkles, Terminal, FileSearch, ShieldAlert, Cpu } from 'lucide-react';

const ROAST_PHASES = [
  { message: 'Scanning your career decisions...', icon: FileSearch, color: 'text-orange-400' },
  { message: 'Checking your ATS survival chances...', icon: Cpu, color: 'text-amber-400' },
  { message: 'Recruiter mode activated...', icon: Sparkles, color: 'text-rose-400' },
  { message: 'Measuring corporate jargon and buzzword density...', icon: Terminal, color: 'text-purple-400' },
  { message: 'Identifying red flags and missing quantifiable achievements...', icon: ShieldAlert, color: 'text-red-400' },
  { message: 'Preparing the roast and executive improvement plan...', icon: Flame, color: 'text-orange-500' },
];

export const AnalyzingScreen: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % ROAST_PHASES.length);
    }, 2400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 450);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentPhase = ROAST_PHASES[phaseIndex];
  const CurrentIcon = currentPhase.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        {/* Pulsing fire rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-rose-600 opacity-20 blur-2xl animate-pulse" />
        <div className="absolute -inset-4 rounded-full border border-orange-500/30 animate-spin duration-1000" />
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl fire-glow">
          <Flame className="h-12 w-12 text-orange-500 animate-bounce" />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>Gemini 4 Flash Neural Engine</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Heating Up The Roasting Oven...
        </h2>

        <div className="flex items-center justify-center gap-2.5 min-h-[32px] text-base sm:text-lg font-medium text-neutral-300">
          <CurrentIcon className={`h-5 w-5 ${currentPhase.color} animate-pulse`} />
          <span className="transition-all duration-300">{currentPhase.message}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-8 mx-auto max-w-md">
        <div className="h-2.5 w-full rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div
            className="h-full rounded-full fire-gradient transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Parsing syntax & metrics</span>
          <span>{progress}%</span>
        </div>
      </div>

      <p className="mt-8 text-xs text-neutral-500 italic max-w-md mx-auto">
        "Brutal honesty incoming. Take a deep breath — great careers are forged in the fire."
      </p>
    </div>
  );
};
