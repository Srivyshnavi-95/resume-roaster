import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCheck2,
  Trash2,
  AlertCircle,
  Flame,
  CheckCircle2,
  Loader2,
  Copy,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_RESUMES, SampleResume } from '../utils/sampleResumes';
import { apiRequest } from '../utils/apiClient';

interface ResumeInputProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  fileSize: number | null;
  setFileSize: (size: number | null) => void;
  onRoast: () => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleResume) => void;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({
  resumeText,
  setResumeText,
  fileName,
  setFileName,
  fileSize,
  setFileSize,
  onRoast,
  isLoading,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const fileNameLower = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!isValidExtension) {
      setErrorMsg('Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10MB limit. Please upload a smaller resume or paste the text directly.');
      return;
    }

    setIsParsing(true);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      if (fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.md')) {
        const plainText = (await file.text()).trim();
        if (plainText.length < 30) {
          throw new Error('The uploaded text file is too short or empty. Please paste your full resume.');
        }
        setResumeText(plainText);
        return;
      }

      // Read binary PDF / DOCX file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          const base64Data = res.split(',')[1] || res;
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Failed to read file locally'));
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Call extraction endpoint
      const data = await apiRequest<{ text: string }>('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: file.name,
          mimeType: file.type,
        }),
      });

      setResumeText(data.text);
    } catch (err: any) {
      setFileName('');
      setFileSize(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setErrorMsg(err.message || 'Error parsing document. Please paste the resume content directly.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    setFileSize(null);
    setResumeText('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = resumeText.length;
  const isReadyToRoast = resumeText.trim().length >= 40 && wordCount >= 10;

  return (
    <div id="roast-form" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
        {/* Tab switch: Upload vs Paste */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <UploadCloud className="h-4 w-4 text-orange-400" />
              <span>Upload Document</span>
              <span className="text-[10px] text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded">PDF / DOCX</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'paste'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
              }`}
            >
              <FileText className="h-4 w-4 text-rose-400" />
              <span>Paste Text</span>
              {wordCount > 0 && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                  {wordCount} words
                </span>
              )}
            </button>
          </div>

          {/* Quick sample resume trigger */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-neutral-500">Need inspiration?</span>
            <div className="flex gap-1.5">
              {SAMPLE_RESUMES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    onSelectSample(sample);
                    setActiveTab('paste');
                  }}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-300 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
                  title={sample.description}
                >
                  {sample.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message notification if any */}
        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-800/80 bg-rose-950/40 p-4 text-sm text-rose-200">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Unable to process document: </span>
              {errorMsg}
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-200 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {!fileName ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-neutral-700 bg-neutral-950/60 hover:border-neutral-600 hover:bg-neutral-950'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner mb-4 group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-8 w-8 text-orange-400" />
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Drop your resume here, or <span className="text-orange-400 underline">browse files</span>
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                  Supports PDF (.pdf) and Microsoft Word (.docx, .doc) up to 10MB
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Standard ATS formatting
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Full text extraction
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Secure in-memory scan
                  </span>
                </div>
              </div>
            ) : (
              /* File Uploaded Preview Card */
              <div className="rounded-2xl border border-neutral-700 bg-neutral-950 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0">
                      <FileCheck2 className="h-6 w-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                          {fileName}
                        </span>
                        {fileSize && (
                          <span className="text-xs text-neutral-500 font-mono">
                            ({formatBytes(fileSize)})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                        {isParsing ? (
                          <span className="flex items-center gap-1.5 text-orange-400 font-medium">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Extracting text content...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Extracted {wordCount} words ({charCount} characters)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Extracted text snippet preview */}
                {resumeText && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 max-h-36 overflow-y-auto text-xs text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed select-text">
                    {resumeText.slice(0, 700)}
                    {resumeText.length > 700 && '... [Click "Paste Text" tab to view or edit full text]'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste Resume Text */}
        {activeTab === 'paste' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <label htmlFor="resume-textarea" className="font-semibold text-neutral-300">
                Paste your resume text below:
              </label>
              <div className="flex items-center gap-3">
                <span className="font-mono">
                  {wordCount} words · {charCount} chars
                </span>
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => {
                      setResumeText('');
                      setFileName('');
                      setFileSize(null);
                    }}
                    className="text-neutral-500 hover:text-rose-400 transition-colors"
                  >
                    Clear text
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="resume-textarea"
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (fileName && !fileName.startsWith('Pasted')) {
                  setFileName('Pasted Resume Content');
                }
              }}
              rows={11}
              placeholder="Paste your resume sections here (Professional Summary, Experience, Skills, Education, Projects)..."
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs sm:text-sm text-neutral-200 placeholder-neutral-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all leading-relaxed"
            />
          </div>
        )}

        {/* Mobile sample buttons */}
        <div className="mt-4 flex sm:hidden flex-wrap items-center gap-1.5 text-xs">
          <span className="text-neutral-500">Samples:</span>
          {SAMPLE_RESUMES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                onSelectSample(sample);
                setActiveTab('paste');
              }}
              className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-neutral-400 hover:text-white"
            >
              {sample.role}
            </button>
          ))}
        </div>

        {/* Submit Roast Button & Privacy Note */}
        <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400 text-center sm:text-left leading-relaxed">
            <span className="font-semibold text-neutral-300">Confidential Processing:</span> Your resume is parsed securely in memory solely to generate your roast and ATS analysis. It is never sold or used for public training.
          </p>

          <button
            type="button"
            onClick={onRoast}
            disabled={!isReadyToRoast || isLoading || isParsing}
            className={`group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl px-8 py-3.5 text-base font-bold text-white shadow-xl transition-all ${
              !isReadyToRoast || isLoading || isParsing
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : 'fire-gradient hover:scale-[1.02] active:scale-[0.98] fire-glow cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Roasting in progress...</span>
              </>
            ) : isParsing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Reading resume file...</span>
              </>
            ) : (
              <>
                <Flame className="h-5 w-5 text-yellow-300 animate-pulse group-hover:rotate-12 transition-transform" />
                <span>Roast My Resume 🔥</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
