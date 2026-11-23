import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';

dotenv.config();

export interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
}

export interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (body: any) => VercelResponse | void;
  send?: (body: any) => VercelResponse | void;
}

export function setCorsAndJsonHeaders(res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');
}

export async function parseJsonBody(req: VercelRequest): Promise<Record<string, any>> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf-8'));
      } catch {
        return {};
      }
    }
    if (typeof req.body === 'object') {
      return req.body;
    }
  }

  // Fallback stream read if a serverless runtime did not pre-parse req.body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your environment variables.'
    );
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
// 2. Enforces a per-attempt timeout so requests never hang into proxy/serverless 502/504 pages.
// 3. Retries 503 / overloaded errors up to maxRetries times per model with short exponential backoff.
// 4. On 429, 503 (after retries), timeout, or 404, automatically falls back to 'gemini-3.1-flash-lite'.
export async function generateContentWithRetry(
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

      if (is503OrOverloaded && attempt < maxRetries) {
        attempt++;
        const delayMs = Math.min(500 * Math.pow(2, attempt - 1), 2000);
        console.log(
          `[Gemini AI] 503 Overloaded on '${currentModel}'. Retry ${attempt}/${maxRetries} after ${delayMs}ms.`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

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

export function cleanJsonString(str: string): string {
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

export function handleGeminiError(
  res: VercelResponse,
  error: any,
  prefixMessage: string
): void {
  const errorMessage = String(error?.message || '');
  const isDailyLimit =
    error?.status === 429 ||
    error?.statusCode === 429 ||
    errorMessage.includes('Daily limit') ||
    errorMessage.includes('429') ||
    errorMessage.toLowerCase().includes('quota') ||
    errorMessage.toLowerCase().includes('resource_exhausted');

  res.setHeader('Content-Type', 'application/json');

  if (isDailyLimit) {
    res.status(429).json({
      error: 'Daily limit reached, try again tomorrow',
    });
    return;
  }

  const errStatus = error?.status === 503 || error?.status === 504 ? error.status : 500;
  res.status(errStatus).json({
    error: `${prefixMessage}: ${error?.message || 'Internal AI error'}. Please try again.`,
  });
}
