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
    const { resumeText, targetRole, roastIntensity = 'spicy' } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      res.status(400).json({
        error: 'Please provide valid resume text (at least 50 characters) to roast.',
      });
      return;
    }

    const rolePrompt =
      targetRole && typeof targetRole === 'string' && targetRole.trim().length > 0
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
                  required: [
                    'formatting',
                    'keywordOptimization',
                    'sectionStructure',
                    'readability',
                    'jobRelevance',
                  ],
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
                  required: [
                    'professionalSummary',
                    'workExperience',
                    'skills',
                    'education',
                    'achievements',
                    'grammarAndLanguage',
                  ],
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
              required: [
                'firstImpression',
                'strongestSellingPoint',
                'biggestConcern',
                'easyToScan',
                'scanExplanation',
                'dealBreakerRisk',
              ],
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
                required: [
                  'section',
                  'before',
                  'critique',
                  'after',
                  'impactExplanation',
                ],
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
    res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Roast generation failed:', error);
    handleGeminiError(res, error, 'Roasting engine encountered an issue');
  }
}
