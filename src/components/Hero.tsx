import React from 'react';
import { Flame, Target, Zap, Shield, Sparkles } from 'lucide-react';

interface HeroProps {
  targetRole: string;
  setTargetRole: (role: string) => void;
  roastIntensity: 'mild' | 'spicy' | 'volcanic';
  setRoastIntensity: (intensity: 'mild' | 'spicy' | 'volcanic') => void;
  onScrollToForm: () => void;
}

const COMMON_ROLES = [
  'Software Developer',
  'Data Analyst',
  'Java Developer',
  'UI/UX Designer',
  'Business Analyst',
  'Project Manager',
  'Digital Marketing Executive',
  'DevOps Engineer',
];

export const Hero: React.FC<HeroProps> = ({
  targetRole,
  setTargetRole,
  roastIntensity,
  setRoastIntensity,
  onScrollToForm,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-16">
      {/* Background radial gradient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <div className="h-[480px] w-[640px] rounded-full bg-gradient-to-tr from-orange-600/40 via-red-600/30 to-purple-800/20 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headlines & Controls */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
              <Flame className="h-3.5 w-3.5 animate-bounce" />
              <span>Your Resume Has Been Through Enough. Let's Make It Better.</span>
            </div>

            {/* Large Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              Is Your Resume{' '}
              <span className="text-emerald-400">Hireable</span> or Just{' '}
              <span className="fire-text-gradient">Hilarious?</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-300 max-w-2xl leading-relaxed">
              Upload your resume. Let AI roast it. Get brutally honest feedback, real ATS scoring, and actionable rewrites that actually land interviews.
            </p>

            {/* Target Job Role & Intensity Box */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  What job role are you targeting? <span className="text-neutral-500 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Data Analyst, Product Manager..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                />

                {/* Quick Role Suggestions */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-neutral-500 mr-1">Quick picks:</span>
                  {COMMON_ROLES.slice(0, 5).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        targetRole.toLowerCase() === role.toLowerCase()
                          ? 'bg-orange-500 text-white font-medium'
                          : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roast Heat Level Selector */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Select Roast Heat Level:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoastIntensity('mild')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-center transition-all ${
                      roastIntensity === 'mild'
                        ? 'border-yellow-500/60 bg-yellow-500/15 text-yellow-300 shadow-sm'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-sm font-semibold">Mild Sizzle 🌱</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">Gentle & constructive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoastIntensity('spicy')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-center transition-all ${
                      roastIntensity === 'spicy'
                        ? 'border-orange-500/70 bg-orange-500/20 text-orange-300 shadow-md shadow-orange-500/20'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-sm font-semibold">Spicy Roast 🔥</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">Clever, witty & honest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoastIntensity('volcanic')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-center transition-all ${
                      roastIntensity === 'volcanic'
                        ? 'border-rose-500/80 bg-rose-500/20 text-rose-300 shadow-md shadow-rose-500/20'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-sm font-semibold">Volcanic 🌋</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">Brutal & unapologetic</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Checkpoints */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-orange-400" />
                <span>PDF & DOCX Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-rose-400" />
                <span>ATS Compatibility Score (0-100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Confidential & In-Memory</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Hero Emblem */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-500 via-rose-600 to-purple-600 opacity-30 blur-xl transition-all duration-500 group-hover:opacity-50" />
              
              <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/90 shadow-2xl p-6">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center border border-neutral-800/80 relative">
                  <img
                    src="/src/assets/images/hero_roaster_flame_1794365106588.jpg"
                    alt="Resume Roaster Fire Insignia"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Floating Metric Badges */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs bg-neutral-950/80 backdrop-blur-md rounded-xl p-3 border border-neutral-800">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Typical Roast Impact</div>
                      <div className="text-sm font-bold text-white flex items-center gap-1">
                        <span className="text-orange-400">+42%</span> ATS pass rate
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Engine</div>
                      <div className="text-xs font-mono text-emerald-400 font-medium">Gemini 4 Flash</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs italic text-neutral-400">
                    "Your resume says you're detail-oriented, but your formatting is fighting for its life."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
