export const SYSTEM_PROMPT = `You are an expert content analyzer specializing in SEO, readability, grammar, accessibility, and content quality assessment.

Your task is to analyze written content and provide detailed, actionable feedback in JSON format.

You MUST respond with ONLY valid JSON, no additional text or markdown formatting.

The JSON structure must follow this exact format:
{
  "readability": {
    "score": <float 0-100>,
    "grade_level": <integer>,
    "reading_time_minutes": <integer>,
    "sentence_count": <integer>,
    "avg_sentence_length": <float>,
    "complex_words": <integer>,
    "passive_voice_percentage": <float>,
    "flesch_kincaid_grade": <float>,
    "gunning_fog_index": <float>
  },
  "seo": {
    "score": <float 0-100>,
    "title_analysis": {
      "length": <integer>,
      "has_keyword": <boolean>,
      "optimal": <boolean>,
      "suggestion": <string or null>
    },
    "keyword_density": {
      "<keyword>": <float percentage>
    },
    "header_structure": {
      "h1_count": <integer>,
      "h2_count": <integer>,
      "h3_count": <integer>,
      "proper_hierarchy": <boolean>
    },
    "meta_description_suggestion": <string>,
    "internal_linking_opportunities": <integer>,
    "word_count_optimal": <boolean>,
    "paragraph_length_issues": <integer>
  },
  "grammar": {
    "score": <float 0-100>,
    "grammar_issues": <integer>,
    "spelling_issues": <integer>,
    "punctuation_issues": <integer>,
    "style_issues": <integer>,
    "readability_issues": <integer>
  },
  "accessibility": {
    "score": <float 0-100>,
    "has_alt_text": <boolean>,
    "heading_order_correct": <boolean>,
    "link_text_descriptive": <boolean>,
    "contrast_ratio": <string>,
    "issues_found": <integer>
  },
  "engagement": {
    "score": <float 0-100>,
    "hook_strength": <float 0-100>,
    "call_to_action_present": <boolean>,
    "question_count": <integer>,
    "interactive_elements": <integer>,
    "content_depth_score": <float 0-100>
  },
  "originality": {
    "score": <float 0-100>,
    "ai_generated_probability": <float 0-1>,
    "plagiarism_risk": "low|medium|high",
    "unique_phrase_count": <integer>,
    "common_phrase_count": <integer>
  },
  "sentiment": {
    "score": <float -1 to 1>,
    "label": "positive|neutral|negative",
    "emotion_intensity": <float 0-1>,
    "confidence": <float 0-1>
  },
  "source_relevance": {
    "score": <float 0-100>,
    "sources_referenced": <integer>,
    "claims_verified": <integer>,
    "claims_unverified": <integer>,
    "source_quality_avg": <float 0-100>
  },
  "suggestions": [
    {
      "type": "readability|seo|structure|style|grammar|accessibility|engagement|originality",
      "severity": "high|medium|low",
      "message": <string>
    }
  ],
  "enhancements": {
    "improved_content": <string - the fully rewritten content with improvements>,
    "changes_summary": [
      {
        "original": <string>,
        "improved": <string>,
        "reason": <string>
      }
    ]
  }
}

Analyze the content thoroughly but respond ONLY with the JSON object.`;

export interface AnalysisOptions {
  include_keywords?: boolean;
  include_readability?: boolean;
  include_seo?: boolean;
  include_grammar?: boolean;
  include_accessibility?: boolean;
  include_engagement?: boolean;
  include_originality?: boolean;
  include_sentiment?: boolean;
  include_enhancements?: boolean;
  keyword_focus?: string;
  source_context?: string;
  enhancement_tone?: 'professional' | 'casual' | 'academic' | 'persuasive';
}

export function buildAnalysisPrompt(
  content: string,
  title?: string,
  options: AnalysisOptions = {}
): string {
  let prompt = `Analyze the following content:\n\n`;

  if (title) {
    prompt += `Title: ${title}\n\n`;
  }

  // Include source context if provided
  if (options.source_context) {
    prompt += `=== SOURCE MATERIAL FOR REFERENCE ===\n${options.source_context}\n=== END SOURCE MATERIAL ===\n\n`;
  }

  prompt += `Content:\n${content}\n\n`;

  if (options.keyword_focus) {
    prompt += `Focus Keyword: ${options.keyword_focus}\n\n`;
  }

  prompt += `Provide analysis for:\n`;

  if (options.include_readability !== false) {
    prompt += `- Readability (Flesch score, grade level, sentence structure, Gunning Fog index)\n`;
  }

  if (options.include_seo !== false) {
    prompt += `- SEO optimization (title, keywords, headers, meta description)\n`;
  }

  if (options.include_keywords !== false) {
    prompt += `- Keyword density and distribution\n`;
  }

  if (options.include_grammar !== false) {
    prompt += `- Grammar and language issues\n`;
  }

  if (options.include_accessibility !== false) {
    prompt += `- Accessibility concerns (alt text, heading order, link text)\n`;
  }

  if (options.include_engagement !== false) {
    prompt += `- Content engagement (hook strength, CTA, questions, depth)\n`;
  }

  if (options.include_originality !== false) {
    prompt += `- Originality and AI detection\n`;
  }

  if (options.include_sentiment !== false) {
    prompt += `- Sentiment analysis\n`;
  }

  if (options.include_enhancements !== false) {
    prompt += `- Enhanced version of content with improvements applied\n`;
  }

  // Add tone guidance if specified
  if (options.enhancement_tone) {
    prompt += `\nWhen enhancing, use a ${options.enhancement_tone} tone.\n`;
  }

  // Add source reference guidance
  if (options.source_context) {
    prompt += `\nWhen analyzing, compare content against the provided source material and evaluate source relevance.\n`;
  }

  prompt += `\nRespond with ONLY the JSON object, no additional text.`;

  return prompt;
}
