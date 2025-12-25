export interface ReadabilityResult {
  score: number;
  grade_level: number;
  reading_time_minutes: number;
  sentence_count: number;
  avg_sentence_length: number;
  complex_words: number;
  passive_voice_percentage: number;
  flesch_kincaid_grade?: number;
  gunning_fog_index?: number;
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
  word_count_optimal?: boolean;
  paragraph_length_issues?: number;
}

export interface GrammarResult {
  score: number;
  grammar_issues: number;
  spelling_issues: number;
  punctuation_issues: number;
  style_issues: number;
  readability_issues: number;
}

export interface AccessibilityResult {
  score: number;
  has_alt_text: boolean;
  heading_order_correct: boolean;
  link_text_descriptive: boolean;
  contrast_ratio: string;
  issues_found: number;
}

export interface EngagementResult {
  score: number;
  hook_strength: number;
  call_to_action_present: boolean;
  question_count: number;
  interactive_elements: number;
  content_depth_score: number;
}

export interface OriginalityResult {
  score: number;
  ai_generated_probability: number;
  plagiarism_risk: 'low' | 'medium' | 'high';
  unique_phrase_count: number;
  common_phrase_count: number;
}

export interface SentimentResult {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  emotion_intensity: number;
  confidence: number;
}

export interface SourceRelevanceResult {
  score: number;
  sources_referenced: number;
  claims_verified: number;
  claims_unverified: number;
  source_quality_avg: number;
}

export interface Suggestion {
  type: 'readability' | 'seo' | 'structure' | 'style' | 'grammar' | 'engagement' | 'accessibility' | 'originality';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface EnhancementChanges {
  original: string;
  improved: string;
  reason: string;
}

export interface EnhancementsResult {
  improved_content: string;
  changes_summary: EnhancementChanges[];
}

export interface AnalysisResult {
  readability: ReadabilityResult;
  seo: SeoResult;
  grammar?: GrammarResult;
  accessibility?: AccessibilityResult;
  engagement?: EngagementResult;
  originality?: OriginalityResult;
  sentiment?: SentimentResult;
  source_relevance?: SourceRelevanceResult;
  suggestions: Suggestion[];
  enhancements?: EnhancementsResult;
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
