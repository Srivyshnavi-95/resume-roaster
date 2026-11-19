import React from 'react';
import { Flame, ShieldAlert, Cpu, Award, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <div id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Section 1: The Harsh Realities of Hiring */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
          <Flame className="h-3.5 w-3.5" />
          <span>Why 85% of Resumes Never Reach A Human</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Your Resume Is Fighting Two Brutal Gatekeepers
        </h2>
        <p className="text-sm sm:text-base text-neutral-400">
          First, ruthless ATS parsers scanning for rigid keywords and standard formatting. Second, an exhausted recruiter who gives your bullet points exactly 6 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">The ATS Keyword Trap</h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Applicant Tracking Systems don't read between the lines. If your resume lacks exact industry skills or uses multi-column templates, you get automatically filtered out before a human ever looks.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Buzzword Hall of Shame</h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            "Results-driven team player with synergistic passions." Every recruiter has read this 10,000 times today. Resume Roaster flags cliché fluff and replaces it with concrete accomplishments.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">The Zero-Metric Curse</h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Listing job duties is not the same as proving impact. If your bullet points don't quantify scale, budget, speed, or growth, you are invisible to hiring managers.
          </p>
        </div>
      </div>

      {/* Section 2: How Resume Roaster Reconstructs Your Career */}
      <div id="rubric" className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 sm:p-12 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              The 5-Pillar Diagnostic Engine
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Surgical Feedback, Not Generic Platitudes
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              We don't just tell you that your resume is bad. We dissect every sentence into measurable scores and give you side-by-side rewritten examples you can immediately copy into your draft.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'ATS formatting & header standardization scan',
                'Target job role keyword density analysis',
                'Simulated 6-second recruiter first impression test',
                'Red flag detector for unexplained gaps & passive voice',
                'Before-and-after quantified bullet point transformations',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-3">
              <span className="font-semibold text-white">Interactive Transformation Preview</span>
              <span className="text-emerald-400 font-mono">Live Example</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-rose-400">What you submitted:</span>
                <p className="text-neutral-300 font-mono">"Responsible for customer support and handling tickets."</p>
              </div>

              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400">How Resume Roaster rewrites it:</span>
                <p className="text-emerald-200 font-mono">
                  "Resolved 120+ high-priority technical escalations weekly with a 98% CSAT rating, cutting resolution time by 30%."
                </p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 italic text-center pt-2">
              No fabricated experience — pure strategic framing and quantifiable impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
