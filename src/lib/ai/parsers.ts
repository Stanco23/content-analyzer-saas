export interface ReadabilityResult {
  score: number;
  grade_level: number;
  reading_time_minutes: number;
  sentence_count: number;
  avg_sentence_length: number;
  complex_words: number;
  passive_voice_percentage: number;
}

export interface SeoResult {
  score: number;
  title_analysis: {
    length: number;
    has_keyword: boolean;
    optimal: boolean;
    suggestion: string | null;
  };
  keyword_density: Record<string, number>;
  header_structure: {
    h1_count: number;
    h2_count: number;
    h3_count: number;
    proper_hierarchy: boolean;
  };
  meta_description_suggestion: string;
  internal_linking_opportunities: number;
}

export interface Suggestion {
  type: 'readability' | 'seo' | 'structure' | 'style';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface AnalysisResult {
  readability: ReadabilityResult;
  seo: SeoResult;
  suggestions: Suggestion[];
}

export function parseAnalysisResponse(text: string): AnalysisResult {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    return parsed as AnalysisResult;
  } catch (error) {
    console.error('Failed to parse analysis response:', text);
    throw new Error('Invalid analysis response format');
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
