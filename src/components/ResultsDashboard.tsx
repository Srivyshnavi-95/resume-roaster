import React, { useState } from 'react';
import {
  Flame,
  BarChart3,
  AlertTriangle,
  Briefcase,
  Wand2,
  Download,
  Copy,
  Share2,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronRight,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { RoastResult } from '../types/roaster';
import confetti from 'canvas-confetti';

interface ResultsDashboardProps {
  result: RoastResult;
  targetRole?: string;
  fileName?: string;
  originalResume: string;
  onRoastAgain: () => void;
  onDownloadPdf: () => void;
  onOpenImproveModal: () => void;
  onOpenShareModal: () => void;
  isGeneratingImprovement: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  targetRole,
  fileName,
  originalResume,
  onRoastAgain,
  onDownloadPdf,
  onOpenImproveModal,
  onOpenShareModal,
  isGeneratingImprovement,
}) => {
  const [activeTab, setActiveTab] = useState<'roast' | 'ats' | 'flags' | 'recruiter' | 'fix'>('roast');
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti if score is high or good verdict
  React.useEffect(() => {
    if (result.overallScore >= 75 || result.finalVerdict.badge.includes('Hireable')) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#fbbf24', '#10b981'],
      });
    }
  }, [result]);

  const handleCopyFeedback = async () => {
    const formattedText = `🔥 RESUME ROAST REPORT 🔥
Target Role: ${targetRole || 'General Industry Standard'}
Overall Score: ${result.overallScore}/100 | ATS Score: ${result.atsScore.score}/100 | Verdict: ${result.finalVerdict.badge}

"${result.roastTitle}"
${result.roastOfTheDay}

ROAST SUMMARY:
${result.roastSummary}

TOP WEAKNESSES:
${result.brutalTruth.map((w, i) => `${i + 1}. ${w.title}: ${w.whatIsWrong}\n   Fix: ${w.howToFix}`).join('\n\n')}

RED FLAGS:
${result.redFlags.map((r) => `[${r.severity.toUpperCase()}] ${r.flag}: ${r.evidence}`).join('\n')}

RECRUITER PERSPECTIVE:
- 6-Second Impression: ${result.recruiterReview.firstImpression}
- Biggest Concern: ${result.recruiterReview.biggestConcern}
- Easy to Scan: ${result.recruiterReview.easyToScan ? 'Yes' : 'No'}

NEXT STEPS:
${result.finalVerdict.nextSteps.map((s) => `• ${s}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-950/40', border: 'border-emerald-800' };
    if (score >= 65) return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-950/40', border: 'border-amber-800' };
    return { text: 'text-rose-400', stroke: '#f43f5e', bg: 'bg-rose-950/40', border: 'border-rose-800' };
  };

  const overallColors = getScoreColor(result.overallScore);
  const atsColors = getScoreColor(result.atsScore.score);
  const contentColors = getScoreColor(result.contentQualityScore.score);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <span>Confidential Resume Diagnostic</span>
            <span>·</span>
            <span className="text-orange-400">{fileName || 'Submitted Resume'}</span>
            {targetRole && (
              <>
                <span>·</span>
                <span className="text-neutral-300 font-medium">Target: {targetRole}</span>
              </>
            )}
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            The Diagnosis Is In 🔥
          </h2>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Download full analysis as a confidential PDF report"
          >
            <Download className="h-4 w-4 text-orange-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleCopyFeedback}
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Copy full text roast to clipboard"
          >
            <Copy className="h-4 w-4 text-neutral-400" />
            <span>{copied ? 'Copied!' : 'Copy Roast'}</span>
          </button>

          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Share2 className="h-4 w-4 text-purple-400" />
            <span>Share</span>
          </button>

          <button
            onClick={onRoastAgain}
            className="flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-orange-400" />
            <span>Roast Again</span>
          </button>
        </div>
      </div>

      {/* Hero Metrics Strip: Overall, ATS, Content Quality & Final Verdict */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Score */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Overall Roast Score
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-4xl font-extrabold tabular-nums font-mono ${overallColors.text}`}>
                {result.overallScore}
              </span>
              <span className="text-sm font-semibold text-neutral-500">/100</span>
            </div>
            <div className="mt-1 text-xs text-neutral-400">
              {result.overallScore >= 80 ? 'Exceptional foundation' : result.overallScore >= 65 ? 'Competitive with flaws' : 'Needs major surgery'}
            </div>
          </div>
          {/* Circular Indicator */}
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={overallColors.stroke}
                strokeWidth="3.5"
                strokeDasharray={`${result.overallScore}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Flame className={`absolute h-6 w-6 ${overallColors.text}`} />
          </div>
        </div>

        {/* Metric 2: ATS Compatibility */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              ATS Compatibility
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-4xl font-extrabold tabular-nums font-mono ${atsColors.text}`}>
                {result.atsScore.score}
              </span>
              <span className="text-sm font-semibold text-neutral-500">/100</span>
            </div>
            <div className="mt-1 text-xs text-neutral-400">
              Keyword & parsing health
            </div>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={atsColors.stroke}
                strokeWidth="3.5"
                strokeDasharray={`${result.atsScore.score}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <BarChart3 className={`absolute h-6 w-6 ${atsColors.text}`} />
          </div>
        </div>

        {/* Metric 3: Content Quality */}
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Content & Metrics
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className={`text-4xl font-extrabold tabular-nums font-mono ${contentColors.text}`}>
                {result.contentQualityScore.score}
              </span>
              <span className="text-sm font-semibold text-neutral-500">/100</span>
            </div>
            <div className="mt-1 text-xs text-neutral-400">
              Verbs, metrics & depth
            </div>
          </div>
          <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
            <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke={contentColors.stroke}
                strokeWidth="3.5"
                strokeDasharray={`${result.contentQualityScore.score}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <FileCheck className={`absolute h-6 w-6 ${contentColors.text}`} />
          </div>
        </div>

        {/* Metric 4: Final Verdict Badge */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950/30 p-5 shadow-xl flex flex-col justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            Hiring Verdict
          </div>
          <div className="my-1.5">
            <div className="text-lg font-black text-white flex items-center gap-2">
              {result.finalVerdict.badge}
            </div>
            <p className="mt-1 text-xs text-neutral-300 line-clamp-2 leading-relaxed">
              {result.finalVerdict.verdictSummary}
            </p>
          </div>
          <div className="text-[11px] text-orange-400 font-medium flex items-center gap-1">
            <span>See tactical remedies</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Roast of the Day Quote Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-red-950/30 to-purple-950/30 p-5 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 shrink-0">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Roast Of The Day 💬
            </div>
            <blockquote className="text-base sm:text-lg font-semibold italic text-neutral-100">
              "{result.roastOfTheDay}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Main Tabbed Navigation Contract */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab('roast')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'roast'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>The Roast 🔥</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'ats'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>ATS Score 📊</span>
          <span className="text-xs bg-neutral-900/60 px-1.5 py-0.5 rounded font-mono">
            {result.atsScore.score}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'flags'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Red Flags 🚩</span>
          <span className="text-xs bg-neutral-900/60 px-1.5 py-0.5 rounded font-mono">
            {result.redFlags.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('recruiter')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'recruiter'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Recruiter's Review 👔</span>
        </button>

        <button
          onClick={() => setActiveTab('fix')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'fix'
              ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <Wand2 className="h-4 w-4 text-yellow-300" />
          <span>Fix My Resume ✨</span>
          <span className="text-[11px] bg-rose-950/60 text-yellow-300 border border-rose-800/60 px-1.5 py-0.5 rounded font-bold">
            Rewrites
          </span>
        </button>
      </div>

      {/* Tab 1: The Roast 🔥 */}
      {activeTab === 'roast' && (
        <div className="space-y-8">
          {/* Main Roast Critique Card */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                AI Executive Roaster
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs text-neutral-400 font-mono">Unfiltered Truth</span>
            </div>

            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {result.roastTitle}
            </h3>

            <div className="mt-4 text-base sm:text-lg text-neutral-200 leading-relaxed space-y-4 whitespace-pre-line border-l-2 border-orange-500 pl-4 py-1">
              {result.roastSummary}
            </div>
          </div>

          {/* Brutal Truth Section: Top 5 Weaknesses */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>The Brutal Truth</span>
                <span className="text-xs text-neutral-400 font-normal">
                  (Top 5 Vulnerabilities Costing You Interviews)
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.brutalTruth.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-lg flex flex-col justify-between hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold font-mono">
                        {index + 1}
                      </span>
                      <h4 className="text-base font-bold text-white">{item.title}</h4>
                    </div>

                    <div className="text-xs text-neutral-300">
                      <span className="font-semibold text-rose-400">What is wrong: </span>
                      {item.whatIsWrong}
                    </div>

                    <div className="text-xs text-neutral-400">
                      <span className="font-semibold text-amber-400">Why it's a problem: </span>
                      {item.whyItIsAProblem}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 text-xs text-emerald-300 bg-emerald-950/20 rounded-xl p-2.5 border border-emerald-900/30">
                    <span className="font-semibold text-emerald-400">How to fix: </span>
                    {item.howToFix}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Verdict Callout with Action Plan */}
          <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-neutral-900 via-orange-950/20 to-neutral-900 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Candidate Action Plan
                </span>
                <h4 className="mt-1 text-2xl font-black text-white">
                  Next Steps for Career Acceleration
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('fix')}
                className="flex items-center gap-2 rounded-xl fire-gradient px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition-transform"
              >
                <Wand2 className="h-4 w-4" />
                <span>See Rewritten Bullet Points</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.finalVerdict.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-xs text-neutral-300 flex items-start gap-3"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ATS Score 📊 */}
      {activeTab === 'ats' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Applicant Tracking System (ATS) Diagnostic
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  ATS Score: <span className={atsColors.text}>{result.atsScore.score}/100</span>
                </h3>
                <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
                  {result.atsScore.explanation}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-center min-w-[200px]">
                <div className="text-[11px] text-neutral-400 uppercase font-semibold">Survival Probability</div>
                <div className="text-2xl font-black text-white mt-1">
                  {result.atsScore.score >= 75 ? 'High (Top 15%)' : result.atsScore.score >= 55 ? 'Moderate Risk' : 'High Filter Risk'}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">Simulated against Workday & Greenhouse</div>
              </div>
            </div>

            {/* Sub-Score Bars */}
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
                ATS Metric Breakdown
              </h4>

              <div className="space-y-3">
                {[
                  { label: 'Formatting & Layout Cleanliness', value: result.atsScore.breakdown.formatting },
                  { label: 'Keyword Optimization & Density', value: result.atsScore.breakdown.keywordOptimization },
                  { label: 'Section Structure & Header Standardization', value: result.atsScore.breakdown.sectionStructure },
                  { label: 'Machine Readability & Parseability', value: result.atsScore.breakdown.readability },
                  { label: 'Target Job Role Relevance', value: result.atsScore.breakdown.jobRelevance },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-300">{item.label}</span>
                      <span className="font-mono text-neutral-400">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                      <div
                        className={`h-full rounded-full ${
                          item.value >= 75 ? 'bg-emerald-500' : item.value >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords Section */}
            {result.atsScore.missingKeywords && result.atsScore.missingKeywords.length > 0 && (
              <div className="mt-8 pt-6 border-t border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <h4 className="text-sm font-bold text-white">
                    Recommended Keywords to Inject {targetRole ? `for "${targetRole}"` : ''}
                  </h4>
                </div>
                <p className="text-xs text-neutral-400">
                  ATS parsers scan for these specific phrases. Weaving them naturally into your bullet points will dramatically boost your match percentage.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.atsScore.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs font-medium text-orange-300"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content Quality Deep Dive */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Content Quality Score</h4>
                <p className="text-xs text-neutral-400 mt-0.5">{result.contentQualityScore.explanation}</p>
              </div>
              <span className={`text-2xl font-mono font-bold ${contentColors.text}`}>
                {result.contentQualityScore.score}/100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Summary', score: result.contentQualityScore.breakdown.professionalSummary },
                { label: 'Experience', score: result.contentQualityScore.breakdown.workExperience },
                { label: 'Skills', score: result.contentQualityScore.breakdown.skills },
                { label: 'Education', score: result.contentQualityScore.breakdown.education },
                { label: 'Achievements', score: result.contentQualityScore.breakdown.achievements },
                { label: 'Grammar & Tone', score: result.contentQualityScore.breakdown.grammarAndLanguage },
              ].map((sub, i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <div className="text-[11px] text-neutral-400 font-medium">{sub.label}</div>
                  <div className="mt-1 text-lg font-bold font-mono text-white">{sub.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Red Flags 🚩 */}
      {activeTab === 'flags' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Red Flag Detector</span>
                <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold">
                  {result.redFlags.length} Detected
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Potential friction points identified by the recruiter simulation engine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.redFlags.map((rf, idx) => {
              const isHigh = rf.severity.toLowerCase() === 'high';
              const isMedium = rf.severity.toLowerCase() === 'medium';
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 shadow-lg flex flex-col justify-between ${
                    isHigh
                      ? 'border-rose-800/80 bg-rose-950/20'
                      : isMedium
                      ? 'border-amber-800/80 bg-amber-950/20'
                      : 'border-neutral-800 bg-neutral-900/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${isHigh ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-neutral-400'}`} />
                        {rf.flag}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                          isHigh
                            ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                            : isMedium
                            ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {rf.severity} risk
                      </span>
                    </div>

                    <div className="rounded-xl bg-neutral-950/70 p-3 border border-neutral-800/80 text-xs text-neutral-300 font-mono">
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider mb-1">Observed in resume:</span>
                      "{rf.evidence}"
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 text-xs text-emerald-300 bg-emerald-950/30 rounded-xl p-3 border border-emerald-900/40">
                    <span className="font-semibold text-emerald-400 block mb-0.5">Recommended Remedy:</span>
                    {rf.remedy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Recruiter's Review 👔 */}
      {activeTab === 'recruiter' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Simulated 6-Second Screen
              </span>
              <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                What A Senior Recruiter Sees In 6 Seconds
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Recruiters spend an average of 6 to 7.4 seconds on an initial scan. Here is the simulated human reaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Impression */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <Briefcase className="h-4 w-4 text-purple-400" />
                  First Impression (0-6s)
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  "{result.recruiterReview.firstImpression}"
                </p>
              </div>

              {/* Strongest Selling Point */}
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Strongest Selling Point
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {result.recruiterReview.strongestSellingPoint}
                </p>
              </div>

              {/* Biggest Concern */}
              <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Biggest Hesitation / Concern
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {result.recruiterReview.biggestConcern}
                </p>
              </div>

              {/* Deal Breaker Risk */}
              <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                  <XCircle className="h-4 w-4 text-rose-400" />
                  Potential Deal Breaker
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {result.recruiterReview.dealBreakerRisk}
                </p>
              </div>
            </div>

            {/* Scan Test Pass/Fail */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Visual Scan Test
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  {result.recruiterReview.easyToScan ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-5 w-5" /> Scannable Layout Passed
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <XCircle className="h-5 w-5" /> Difficult to Scan Quickly
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300">
                  {result.recruiterReview.scanExplanation}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('fix')}
                className="flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors shrink-0"
              >
                <span>Fix Scannability</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Fix My Resume ✨ */}
      {activeTab === 'fix' && (
        <div className="space-y-6">
          {/* Overhaul Hero CTA Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/40 bg-gradient-to-r from-orange-950/60 via-red-950/40 to-purple-950/50 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Executive Rewrite Engine</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Generate An Overhauled, ATS-Ready Resume Draft
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Transform passive phrases, inject quantifiable impact placeholders, format for modern ATS algorithms, and compare the side-by-side differences.
                </p>
              </div>

              <button
                onClick={onOpenImproveModal}
                disabled={isGeneratingImprovement}
                className="flex items-center justify-center gap-2.5 rounded-2xl fire-gradient px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <Wand2 className="h-4 w-4 text-yellow-300" />
                <span>{isGeneratingImprovement ? 'Rewriting resume...' : 'Generate Overhauled Resume ✨'}</span>
              </button>
            </div>
          </div>

          {/* Before & After Bullet Point Transformations */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Before & After Bullet Point Transformations</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Concrete examples from your resume rewritten with strong action verbs and metrics.
              </p>
            </div>

            <div className="space-y-4">
              {result.improvementSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Transformation #{idx + 1} · {item.section}
                    </span>
                    <span className="text-[11px] text-neutral-500 italic">
                      High Impact Rewrite
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before Card */}
                    <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5" /> Before (Weak / Passive)
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-200 font-mono">
                        "{item.before}"
                      </p>
                      <p className="text-xs text-rose-300/80 italic pt-1 border-t border-rose-900/30">
                        Critique: {item.critique}
                      </p>
                    </div>

                    {/* After Card */}
                    <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> After (High Impact / Quantified)
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-100 font-mono">
                        "{item.after}"
                      </p>
                      <p className="text-xs text-emerald-300/80 pt-1 border-t border-emerald-900/30">
                        Why it works: {item.impactExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
