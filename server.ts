import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parsers with support for base64 file payloads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to get Google Gemini Client with friendly error when API key is missing
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set your Gemini API key in the Settings > Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Automatic retry & fallback helper:
// 1. Tries primary active model ('gemini-4-hydrogen' with ThinkingLevel.LOW for fast JSON generation).
// 2. Enforces a per-attempt timeout so requests never hang into proxy 502/504 HTML pages.
// 3. Retries 503 / overloaded errors up to maxRetries times per model with short exponential backoff.
// 4. On 429, 503 (after retries), timeout, or 404, automatically falls back to 'gemini-3.1-flash-lite'.
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 2,
  perAttemptTimeoutMs = 18000
) {
  const initialModel = params.model || 'gemini-4-hydrogen';
  const modelChain = Array.from(
    new Set([initialModel, 'gemini-3.1-flash-lite'])
  );

  let modelIndex = 0;
  let attempt = 0;
  let sawQuota429 = false;

  while (true) {
    const currentModel = modelChain[modelIndex];
    const startTime = Date.now();
    const baseConfig = params.config ? { ...params.config } : {};

    if (currentModel === 'gemini-4-hydrogen' && !baseConfig.thinkingConfig) {
      baseConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
    } else if (currentModel === 'gemini-3.1-flash-lite') {
      delete baseConfig.thinkingConfig;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const apiPromise = ai.models.generateContent({
        ...params,
        model: currentModel,
        config: baseConfig,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const timeoutErr: any = new Error(
            `Model '${currentModel}' timed out after ${perAttemptTimeoutMs}ms`
          );
          timeoutErr.status = 504;
          timeoutErr.isTimeout = true;
          reject(timeoutErr);
        }, perAttemptTimeoutMs);
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);
      console.log(
        `[Gemini AI] '${currentModel}' succeeded in ${Date.now() - startTime}ms`
      );
      return result;
    } catch (error: any) {
      const errorMessage = String(error?.message || error || '');
      const status = error?.status || error?.statusCode || error?.code;
      const isTimeout = Boolean(error?.isTimeout) || status === 504;

      const isQuotaOr429 =
        status === 429 ||
        status === '429' ||
        status === 'RESOURCE_EXHAUSTED' ||
        errorMessage.includes('429') ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('resource_exhausted') ||
        errorMessage.toLowerCase().includes('resource has been exhausted');

      const is503OrOverloaded =
        status === 503 ||
        status === '503' ||
        status === 'UNAVAILABLE' ||
        errorMessage.includes('503') ||
        errorMessage.toLowerCase().includes('overloaded') ||
        errorMessage.toLowerCase().includes('unavailable');

      const is404NotFound =
        status === 404 ||
        status === '404' ||
        status === 'NOT_FOUND' ||
        errorMessage.includes('404') ||
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('no longer available');

      if (isQuotaOr429) {
        sawQuota429 = true;
      }

      // Retry 503 / overloaded up to maxRetries times on the current model before falling back
      if (is503OrOverloaded && attempt < maxRetries) {
        attempt++;
        const delayMs = Math.min(500 * Math.pow(2, attempt - 1), 2000);
        console.log(
          `[Gemini AI] 503 Overloaded on '${currentModel}'. Retry ${attempt}/${maxRetries} after ${delayMs}ms.`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // Advance to next fallback model on 429, 503 (exhausted retries), timeout, or 404
      if (
        (isQuotaOr429 || is503OrOverloaded || isTimeout || is404NotFound) &&
        modelIndex + 1 < modelChain.length
      ) {
        const nextModel = modelChain[modelIndex + 1];
        console.log(
          `[Gemini AI] Model '${currentModel}' unavailable (${status || 'error'}) after ${Date.now() - startTime}ms. Falling back to '${nextModel}'.`
        );
        modelIndex++;
        attempt = 0;
        continue;
      }

      // If quota 429 limit reached across models, return friendly message
      if (sawQuota429 || isQuotaOr429) {
        console.log(`[Gemini AI] Quota 429 limit reached across all models.`);
        const quotaErr: any = new Error('Daily limit reached, try again tomorrow');
        quotaErr.status = 429;
        throw quotaErr;
      }

      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}

// Cleans markdown code blocks (```json ... ```) from model text output
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Route: Extract text from uploaded document (PDF, DOCX, TXT, MD)
 */
app.post('/api/parse-resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileBase64, fileName, mimeType } = req.body;

    if (!fileBase64) {
      res.status(400).json({ error: 'No file data received' });
      return;
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let extractedText = '';

    const lowerName = (fileName || '').toLowerCase();
    const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf');
    const isDocx =
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword' ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc');

    if (isPdf) {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      extractedText = textResult.text || '';
      await parser.destroy();
    } else if (isDocx) {
      const mammothModule = await import('mammoth');
      const mammoth = mammothModule.default || mammothModule;
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else {
      // Plain text / markdown / fallback
      extractedText = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 30) {
      res.status(400).json({
        error:
          'Could not extract meaningful text from this file. If this is a scanned PDF image, please copy and paste the text directly.',
      });
      return;
    }

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    res.json({
      text: extractedText,
      fileName,
      wordCount,
      charCount: extractedText.length,
    });
  } catch (error: any) {
    console.error('Text extraction failed:', error);
    res.status(500).json({
      error: `Failed to extract resume text: ${error.message || 'Unknown parsing error'}. Please paste the text manually.`,
    });
  }
});

/**
 * Route: Roast and analyze resume using Gemini 4 Flash (with fallback)
 */
app.post('/api/roast', async (req: Request, res: Response): Promise<void> => {
  try {
    const { resumeText, targetRole, roastIntensity = 'spicy' } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      res.status(400).json({
        error: 'Please provide valid resume text (at least 50 characters) to roast.',
      });
      return;
    }

    const rolePrompt = targetRole && targetRole.trim().length > 0
      ? `The candidate is specifically targeting the role of: "${targetRole.trim()}". Tailor ATS keywords, technical expectations, seniority observations, and recruiter perspective to this target role.`
      : `No target role was specified. Perform a comprehensive general industry analysis without assuming any specific position, evaluating universal professional standards.`;

    const systemInstruction = `You are RESUME ROASTER 🔥 — an elite, wickedly funny, brutally honest, but deeply constructive career mentor and executive recruiter.
Your mission is to roast resumes with surgical wit, hilarious sarcasm, and unforgettable observations, while simultaneously providing world-class, professional, actionable improvements.

GUIDELINES FOR THE ROAST:
- Be witty, clever, funny, and playfully sarcastic. Roast formatting sins, corporate buzzword clichés, passive phrases, vague accomplishments, and strange structure.
- CRITICAL ETHICAL BOUNDARY: Roast the RESUME, the choices, and the wording. NEVER roast or insult the person's identity, gender, race, nationality, age, or personal background.
- Balance brutal truth with genuine empathy and empowering, tactical solutions.
- Never invent fake past achievements or fake employers; always use realistic placeholders (e.g. "[X% increase]", "[Tool Name]") when recommending metric improvements.
- Return output strictly conforming to the requested JSON schema.`;

    const userPrompt = `Analyze and roast this resume:
${rolePrompt}
Roast Intensity Preference: ${roastIntensity} (Options: mild, spicy, volcanic).

RESUME TEXT:
"""
${resumeText.slice(0, 15000)}
"""

Provide an in-depth, entertaining, and highly constructive evaluation across all categories:
1. Overall Resume Roast (punchy title, witty 2-3 paragraph roast, roast of the day one-liner)
2. Overall Score (0-100), ATS Score (0-100 with sub-scores: formatting, keywordOptimization, sectionStructure, readability, jobRelevance, explanation, and missingKeywords array)
3. Content Quality Score (0-100 with sub-scores: professionalSummary, workExperience, skills, education, achievements, grammarAndLanguage, explanation)
4. Brutal Truth (top 5 specific weaknesses with: title, whatIsWrong, whyItIsAProblem, howToFix)
5. Red Flag Detector (list of red flags with: flag, severity ['high'|'medium'|'low'], evidence, remedy)
6. Recruiter Perspective (firstImpression in 6 seconds, strongestSellingPoint, biggestConcern, easyToScan boolean, dealBreakerRisk)
7. Improvement Suggestions (at least 4 concrete before-and-after bullet point transformations: section, before, critique, after, impactExplanation)
8. Final Verdict (strictly one of: "🔥 Hireable Potential", "⚡ Needs Some Work", "🚨 Major Resume Makeover Required", plus verdictSummary and 3-4 nextSteps).`;

    const ai = getGeminiClient();
    const response = await generateContentWithRetry(ai, {
      model: 'gemini-4-hydrogen',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roastTitle: { type: Type.STRING },
            roastSummary: { type: Type.STRING },
            roastOfTheDay: { type: Type.STRING },
            overallScore: { type: Type.INTEGER },
            atsScore: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    formatting: { type: Type.INTEGER },
                    keywordOptimization: { type: Type.INTEGER },
                    sectionStructure: { type: Type.INTEGER },
                    readability: { type: Type.INTEGER },
                    jobRelevance: { type: Type.INTEGER },
                  },
                  required: ['formatting', 'keywordOptimization', 'sectionStructure', 'readability', 'jobRelevance'],
                },
                explanation: { type: Type.STRING },
                missingKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['score', 'breakdown', 'explanation', 'missingKeywords'],
            },
            contentQualityScore: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    professionalSummary: { type: Type.INTEGER },
                    workExperience: { type: Type.INTEGER },
                    skills: { type: Type.INTEGER },
                    education: { type: Type.INTEGER },
                    achievements: { type: Type.INTEGER },
                    grammarAndLanguage: { type: Type.INTEGER },
                  },
                  required: ['professionalSummary', 'workExperience', 'skills', 'education', 'achievements', 'grammarAndLanguage'],
                },
                explanation: { type: Type.STRING },
              },
              required: ['score', 'breakdown', 'explanation'],
            },
            brutalTruth: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  whatIsWrong: { type: Type.STRING },
                  whyItIsAProblem: { type: Type.STRING },
                  howToFix: { type: Type.STRING },
                },
                required: ['title', 'whatIsWrong', 'whyItIsAProblem', 'howToFix'],
              },
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  flag: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  remedy: { type: Type.STRING },
                },
                required: ['flag', 'severity', 'evidence', 'remedy'],
              },
            },
            recruiterReview: {
              type: Type.OBJECT,
              properties: {
                firstImpression: { type: Type.STRING },
                strongestSellingPoint: { type: Type.STRING },
                biggestConcern: { type: Type.STRING },
                easyToScan: { type: Type.BOOLEAN },
                scanExplanation: { type: Type.STRING },
                dealBreakerRisk: { type: Type.STRING },
              },
              required: ['firstImpression', 'strongestSellingPoint', 'biggestConcern', 'easyToScan', 'scanExplanation', 'dealBreakerRisk'],
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  before: { type: Type.STRING },
                  critique: { type: Type.STRING },
                  after: { type: Type.STRING },
                  impactExplanation: { type: Type.STRING },
                },
                required: ['section', 'before', 'critique', 'after', 'impactExplanation'],
              },
            },
            finalVerdict: {
              type: Type.OBJECT,
              properties: {
                badge: { type: Type.STRING },
                verdictSummary: { type: Type.STRING },
                nextSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['badge', 'verdictSummary', 'nextSteps'],
            },
          },
          required: [
            'roastTitle',
            'roastSummary',
            'roastOfTheDay',
            'overallScore',
            'atsScore',
            'contentQualityScore',
            'brutalTruth',
            'redFlags',
            'recruiterReview',
            'improvementSuggestions',
            'finalVerdict',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsedData = JSON.parse(cleanJsonString(rawText));
    res.setHeader('Content-Type', 'application/json');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Roast generation failed:', error);
    const errorMessage = String(error?.message || '');
    const isDailyLimit =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      errorMessage.includes('Daily limit') ||
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('resource_exhausted');

    if (isDailyLimit) {
      res.setHeader('Content-Type', 'application/json');
      res.status(429).json({
        error: 'Daily limit reached, try again tomorrow',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    const errStatus = error?.status === 503 || error?.status === 504 ? error.status : 500;
    res.status(errStatus).json({
      error: `Roasting engine encountered an issue: ${error.message || 'Internal AI error'}. Please try again.`,
    });
  }
});

/**
 * Route: Generate improved ATS-friendly resume draft based on feedback
 */
app.post('/api/improve-resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalResume, targetRole, weaknesses = [] } = req.body;

    if (!originalResume || typeof originalResume !== 'string') {
      res.status(400).json({ error: 'Original resume content is required.' });
      return;
    }

    const systemInstruction = `You are an elite executive resume writer who transforms roasted resumes into ATS-optimized, high-impact career assets.
Your goal is to produce a complete, polished, modern resume rewrite formatted in clean Markdown.
Rules:
- Fix all passive voice; use strong action verbs (Spearheaded, Engineered, Accelerated, Orchestrated).
- Quantify bullet points with realistic placeholders (e.g., "[X% increase]", "[$Y budget]") where specific numbers need user input.
- Format with standard ATS section headers: PROFESSIONAL SUMMARY, CORE COMPETENCIES, PROFESSIONAL EXPERIENCE, EDUCATION, CERTIFICATIONS & PROJECTS.
- Emphasize skills and achievements tailored to the target role (if specified).
- Do not fabricate false credentials or degrees; preserve the authentic background while maximizing impact.`;

    const prompt = `Rewrite this resume into a top 1% executive-grade resume.
Target Role: ${targetRole || 'General Industry Benchmark'}
Known weaknesses to fix: ${JSON.stringify(weaknesses)}

ORIGINAL RESUME:
"""
${originalResume.slice(0, 15000)}
"""

Return JSON with:
1. improvedMarkdown: The complete, formatted markdown text of the overhauled resume.
2. keyChangesMade: Array of 4-6 specific strategic changes made.
3. executiveSummaryHighlight: A 2-sentence elevator pitch summary.`;

    const ai = getGeminiClient();
    const response = await generateContentWithRetry(ai, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedMarkdown: { type: Type.STRING },
            keyChangesMade: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            executiveSummaryHighlight: { type: Type.STRING },
          },
          required: ['improvedMarkdown', 'keyChangesMade', 'executiveSummaryHighlight'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error('No improvement response received.');
    const parsedData = JSON.parse(cleanJsonString(rawText));
    res.setHeader('Content-Type', 'application/json');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Improvement generation failed:', error);
    const errorMessage = String(error?.message || '');
    const isDailyLimit =
      error?.status === 429 ||
      error?.statusCode === 429 ||
      errorMessage.includes('Daily limit') ||
      errorMessage.includes('429') ||
      errorMessage.toLowerCase().includes('quota') ||
      errorMessage.toLowerCase().includes('resource_exhausted');

    if (isDailyLimit) {
      res.setHeader('Content-Type', 'application/json');
      res.status(429).json({
        error: 'Daily limit reached, try again tomorrow',
      });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    const errStatus = error?.status === 503 || error?.status === 504 ? error.status : 500;
    res.status(errStatus).json({
      error: `Failed to generate improved resume: ${error.message || 'Internal error'}.`,
    });
  }
});

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const val = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(val) && val > 0) return val;
  }
  if (process.env.PORT) {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val) && val > 0) return val;
  }
  return 3000;
}

function getHost(): string {
  const hostArgIndex = process.argv.indexOf('--host');
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    return process.argv[hostArgIndex + 1];
  }
  return '0.0.0.0';
}

// Setup Vite middleware in dev or static files in production
async function startServer() {
  // Ensure any unmatched /api/* route returns pure JSON 404, never HTML
  app.all('/api/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}.`,
    });
  });

  // Global Express error handler for API routes
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error('Unhandled API error on', req.path, err);
      res.setHeader('Content-Type', 'application/json');
      res.status(err.status || 500).json({
        error: err.message || 'An unexpected server error occurred.',
      });
      return;
    }
    next(err);
  });

  const httpServer = http.createServer(app);
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = getPort();
  const HOST = getHost();

  // Align Node keep-alive timeout above nginx proxy timeout to prevent intermittent ECONNRESET / Failed to fetch
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 66000;

  httpServer.listen(PORT, HOST, () => {
    console.log(`🔥 Resume Roaster Server active on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
