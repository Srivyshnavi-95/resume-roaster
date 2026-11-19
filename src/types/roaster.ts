export interface AtsBreakdown {
  formatting: number;
  keywordOptimization: number;
  sectionStructure: number;
  readability: number;
  jobRelevance: number;
}

export interface AtsScoreData {
  score: number;
  breakdown: AtsBreakdown;
  explanation: string;
  missingKeywords: string[];
}

export interface ContentQualityBreakdown {
  professionalSummary: number;
  workExperience: number;
  skills: number;
  education: number;
  achievements: number;
  grammarAndLanguage: number;
}

export interface ContentQualityData {
  score: number;
  breakdown: ContentQualityBreakdown;
  explanation: string;
}

export interface BrutalTruthItem {
  title: string;
  whatIsWrong: string;
  whyItIsAProblem: string;
  howToFix: string;
}

export interface RedFlagItem {
  flag: string;
  severity: 'high' | 'medium' | 'low' | string;
  evidence: string;
  remedy: string;
}

export interface RecruiterReviewData {
  firstImpression: string;
  strongestSellingPoint: string;
  biggestConcern: string;
  easyToScan: boolean;
  scanExplanation: string;
  dealBreakerRisk: string;
}

export interface ImprovementSuggestionItem {
  section: string;
  before: string;
  critique: string;
  after: string;
  impactExplanation: string;
}

export interface FinalVerdictData {
  badge: string;
  verdictSummary: string;
  nextSteps: string[];
}

export interface RoastResult {
  roastTitle: string;
  roastSummary: string;
  roastOfTheDay: string;
  overallScore: number;
  atsScore: AtsScoreData;
  contentQualityScore: ContentQualityData;
  brutalTruth: BrutalTruthItem[];
  redFlags: RedFlagItem[];
  recruiterReview: RecruiterReviewData;
  improvementSuggestions: ImprovementSuggestionItem[];
  finalVerdict: FinalVerdictData;
}

export interface ResumeHistoryItem {
  id: string;
  timestamp: number;
  targetRole?: string;
  fileName?: string;
  overallScore: number;
  verdict: string;
  result: RoastResult;
  resumeSnippet: string;
  resumeText: string;
}

export interface ImprovedResumeData {
  improvedMarkdown: string;
  keyChangesMade: string[];
  executiveSummaryHighlight: string;
}
