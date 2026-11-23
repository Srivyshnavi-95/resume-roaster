import { Type } from '@google/genai';
import {
  VercelRequest,
  VercelResponse,
  parseJsonBody,
  getGeminiClient,
  generateContentWithRetry,
  cleanJsonString,
  handleGeminiError,
} from './_lib/gemini.ts';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { originalResume, targetRole, weaknesses = [] } = body;

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
          required: [
            'improvedMarkdown',
            'keyChangesMade',
            'executiveSummaryHighlight',
          ],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error('No improvement response received.');
    const parsedData = JSON.parse(cleanJsonString(rawText));
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Improvement generation failed:', error);
    handleGeminiError(res, error, 'Failed to generate improved resume');
  }
}
