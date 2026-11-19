/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ResumeInput } from './components/ResumeInput';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { ResultsDashboard } from './components/ResultsDashboard';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { ImprovedResumeModal } from './components/ImprovedResumeModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ShareModal } from './components/ShareModal';
import { PrivacyModal } from './components/PrivacyModal';
import { RoastResult, ResumeHistoryItem, ImprovedResumeData } from './types/roaster';
import { SampleResume } from './utils/sampleResumes';
import { exportRoastReportPdf } from './utils/pdfExport';
import { apiRequest } from './utils/apiClient';
import { AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'resume_roaster_history_v1';

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [roastIntensity, setRoastIntensity] = useState<'mild' | 'spicy' | 'volcanic'>('spicy');

  // Async States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);

  // Modal / Drawer States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);

  // Improvement Draft State
  const [improvedData, setImprovedData] = useState<ImprovedResumeData | null>(null);
  const [isGeneratingImprovement, setIsGeneratingImprovement] = useState(false);

  // History loaded from localStorage
  const [history, setHistory] = useState<ResumeHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
    }
  }, []);

  const saveHistoryItem = (newResult: RoastResult, text: string) => {
    try {
      const newItem: ResumeHistoryItem = {
        id: `roast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        targetRole: targetRole || undefined,
        fileName: fileName || 'Pasted Resume',
        overallScore: newResult.overallScore,
        verdict: newResult.finalVerdict.badge,
        result: newResult,
        resumeSnippet: text.slice(0, 150),
        resumeText: text,
      };

      const updated = [newItem, ...history.slice(0, 19)]; // Keep up to 20 past items
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to store history item', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectHistoryItem = (item: ResumeHistoryItem) => {
    setResult(item.result);
    setResumeText(item.resumeText);
    setFileName(item.fileName || '');
    setTargetRole(item.targetRole || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSample = (sample: SampleResume) => {
    setResumeText(sample.content);
    setFileName(sample.title);
    setFileSize(null);
    setTargetRole(sample.role);
    setError(null);
  };

  const handleRoast = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 40) {
      setError('Please provide at least 40 characters of resume content to roast.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);
    setImprovedData(null);

    // Scroll to analysis loader view
    window.scrollTo({ top: 120, behavior: 'smooth' });

    try {
      const data = await apiRequest<RoastResult>('/api/roast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          targetRole: targetRole.trim() || undefined,
          roastIntensity,
        }),
      });

      setResult(data);
      saveHistoryItem(data, resumeText);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Roast error:', err);
      const msg = String(err?.message || '');
      const isDailyLimit =
        msg.includes('Daily limit') ||
        msg.includes('429') ||
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('resource_exhausted');
      setError(isDailyLimit ? 'Daily limit reached, try again tomorrow' : msg || 'An unexpected error occurred during resume roasting.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImprovement = async () => {
    if (!result || !resumeText) return;
    setIsImproveModalOpen(true);

    if (improvedData) {
      // Already generated, show modal immediately
      return;
    }

    setIsGeneratingImprovement(true);
    try {
      const data = await apiRequest<ImprovedResumeData>('/api/improve-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalResume: resumeText,
          targetRole: targetRole || undefined,
          weaknesses: result.brutalTruth,
        }),
      });

      setImprovedData(data);
    } catch (err: any) {
      console.error(err);
      setError(`Improvement generation error: ${err.message}`);
    } finally {
      setIsGeneratingImprovement(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    exportRoastReportPdf(result, targetRole, fileName);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onReset={handleReset}
        hasActiveResult={!!result}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <main className="flex-1">
        {/* Error Notification Banner if top-level failure */}
        {error && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex items-center justify-between rounded-2xl border border-rose-800 bg-rose-950/60 p-4 text-sm text-rose-200 shadow-xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-semibold text-rose-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* State 1: Active Analysis Loading View */}
        {isLoading && <AnalyzingScreen />}

        {/* State 2: Active Roast Results Dashboard */}
        {!isLoading && result && (
          <ResultsDashboard
            result={result}
            targetRole={targetRole}
            fileName={fileName}
            originalResume={resumeText}
            onRoastAgain={handleReset}
            onDownloadPdf={handleDownloadPdf}
            onOpenImproveModal={handleGenerateImprovement}
            onOpenShareModal={() => setIsShareOpen(true)}
            isGeneratingImprovement={isGeneratingImprovement}
          />
        )}

        {/* State 3: Home & Input View */}
        {!isLoading && !result && (
          <>
            <Hero
              targetRole={targetRole}
              setTargetRole={setTargetRole}
              roastIntensity={roastIntensity}
              setRoastIntensity={setRoastIntensity}
              onScrollToForm={() => {
                const el = document.getElementById('roast-form');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <ResumeInput
              resumeText={resumeText}
              setResumeText={setResumeText}
              fileName={fileName}
              setFileName={setFileName}
              fileSize={fileSize}
              setFileSize={setFileSize}
              onRoast={handleRoast}
              isLoading={isLoading}
              onSelectSample={handleSelectSample}
            />

            <FeaturesSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onReset={handleReset}
      />

      {/* Modals & Slide-out Drawers */}
      <ImprovedResumeModal
        isOpen={isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
        data={improvedData}
        originalText={resumeText}
        targetRole={targetRole}
        isLoading={isGeneratingImprovement}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {result && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          result={result}
          targetRole={targetRole}
        />
      )}

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
